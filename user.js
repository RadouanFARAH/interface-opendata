const { json } = require("body-parser");
const { get } = require("http");
const { result } = require("lodash");
var evolan = require("../evolan/evolanquery");


// logs every day ------------------------------------------------------------------------------------
let filename = `User_logs/log_${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}.log`
function updateFilename() {
  filename = `User_logs/log_${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')}.log`
}
const schedule2 = require("node-schedule");
schedule2.scheduleJob("00 00 8 * * *", updateFilename);
const myLoggers = require('log4js');
myLoggers.configure({
  appenders: { mylogger: { type: "file", filename } },
  categories: { default: { appenders: ["mylogger"], level: "ALL" } }
});
const logger = myLoggers.getLogger("default")
// logs every day -------------------------------------------------------------------------------------


class Contrat {
  numero;
  plan;
  utile;
  constructor(numero, plan, utile) {
    this.numero = numero;
    this.plan = plan;
    this.utile = utile;
  }
}
const closingconnection = (con, err, res, treatement) => {
  try {
    if (err) {
      return res
        .json({
          message: "error creationg connection " + err.message,
        })
        .end();
    } else treatement();
  } finally {
    // logger.info("****************cooooon*******", con);
    con.release();
  }
};
module.exports = function (app, connection, request, moment) {
  /* Get user. */
  app.get("/user/testing", (req, res) => {
    res.send("Authenticated");
  });
  // not used
  app.post("/user/get", function (req, res) {
    var id = req.body.id;
    connection.acquire(function (err, con) {
      closingconnection(con, err, res, () => {
        con.query(
          "select * from user where id = ?",
          [id],
          function (err, result) {
            logger.info("ok");
            res.send(result[0]);
          }
        );
      });
    });
  });

  app.post("/user/insertAdresseEV", async function (req, res) {
    var data4 = {
      codeGest: req.body.codeGest,
      villePro: req.body.ville,
      quartierPro: req.body.quartier,
      habitaPRO: req.body.habitat,
      ruePRO: req.body.rue,
      sequenceadresse: req.body.numSeq,
      codepostalePro: req.body.codePostal,
      role: req.body.role,
      numTier: req.body.numTier,
      typeAdresse: req.body.typeAdresse,
    };

    logger.info(data4);
    var reslt;
    if (data4.sequenceadresse) {
      reslt = await evolan.updateadresse(data4);
    } else {
      reslt = await evolan.createadresse(data4);
    }
    logger.info(reslt);
    res.send(reslt);
  });
  const controlDateDebloquage = (date) => {
    let arr = [
      date.substring(0, 4),
      date.substring(4, 6),
      date.substring(6, 8),
    ];
    logger.info(arr, arr.join(""));

    // let dd = arr[1];
    // arr[1] = arr[2];
    // arr[2] = dd;
    let da = arr.join("/");
    logger.info(arr, arr.join(""));

    const d = new Date(da);
    logger.info(d, d.getDay());
    let nbrJrs = new Date(d.getFullYear(), arr[1], 0).getDate();
    let nbrJrsPrev = new Date(d.getFullYear(), arr[1] - 1, 0).getDate();

    if (d.getDay() === 1) {
      arr[2] = (
        "0" +
        (parseInt(arr[2]) + 2 > nbrJrs
          ? (parseInt(arr[2]) + 2) % nbrJrs
          : parseInt(arr[2]) + 2
        ).toString()
      ).slice(-2);
    } else if (d.getDay() === 2) {
      arr[2] = (
        "0" +
        (parseInt(arr[2]) + 1 > nbrJrs
          ? (parseInt(arr[2]) + 1) % nbrJrs
          : parseInt(arr[2]) + 1
        ).toString()
      ).slice(-2);
    } else if (d.getDay() === 4) {
      arr[1] = (
        "0" +
        (parseInt(arr[2]) - 1 <= 0 ? parseInt(arr[1]) - 1 : arr[1]).toString()
      ).slice(-2);
      arr[2] = (
        "0" +
        (parseInt(arr[2]) - 1 <= 0
          ? nbrJrsPrev + (parseInt(arr[2]) - 1)
          : parseInt(arr[2]) - 1
        ).toString()
      ).slice(-2);
    } else if (d.getDay() === 5) {
      arr[1] = (
        "0" +
        (parseInt(arr[2]) - 2 <= 0 ? parseInt(arr[1]) - 1 : arr[1]).toString()
      ).slice(-2);
      arr[2] = (
        "0" +
        (parseInt(arr[2]) - 2 <= 0
          ? nbrJrsPrev + (parseInt(arr[2]) - 2)
          : parseInt(arr[2]) - 2
        ).toString()
      ).slice(-2);
    }
    logger.info(arr[2]);
    arr[2] = arr[2].toLocaleString("en-US", {
      minimumIntegerDigits: 2,
      useGrouping: false,
    });
    // let day = arr[1];
    // arr[1] = arr[2];
    // arr[2] = day;
    logger.info(arr, arr.join(""));
    return arr.join("");

    // this.besoinprospect.datedeblocage = moment(new Date(date)).format(
    //   "DD/MM/YYYY"
    // );
    // return moment(new Date(date)).format("DD/MM/YYYY");
    // logger.info(moment(new Date(date)).format("DD/MM/YYYY"));
  };
  app.post("/user/getPosition", function (req, res) {
    var gps = {
      contexte: req.body.contexte,
      cin: req.body.cin,
    };

    getGPS(gps, res).then((resu) => {
      logger.info("getPosition", resu);
      res.send(resu);
    });
  });

  function getGPS(gps, res) {
    return new Promise((resolve, reject) => {
      connection.acquire(function (err, con) {
        closingconnection(con, err, res, () => {
          con.query(
            "select * from  positiongps where  cin=? and evenement in (?) ",
            [gps.cin, gps.contexte],
            function (err, result) {
              logger.info("err", err, result, gps.contexte);
              if (result?.length > 0) {
                var resultArray = Object.values(
                  JSON.parse(JSON.stringify(result))
                );
                logger.info(resultArray);
                const latestRecord = resultArray.reduce(
                  (prev, current) =>
                    prev.datecapture > current.datecapture ? prev : current,
                  1
                );
                resolve(latestRecord);
              } else {
                resolve({ code: 401 });
              }
            }
          );
        });
      });
    });
  }
  app.post("/user/insercontrat", function (req, res) {
    var codecontrat = req.body.codecontrat;
    var id = req.body.id;

    controlDateDebloquage(req.body.datedeb);
    logger.info("num:" + req.body.numContrat);
    var reslt;
    var reslt2;
    var data3 = {
      numcontrat: req.body.numcontrat,
      codeGest: req.body.codeGest,
    };
    var data4 = {
      codeGest: req.body.codeGest,
      villePro: req.body.ville,
      quartierPro: req.body.quartier,
      habitaPRO: req.body.habitat,
      ruePRO: req.body.rue,
      sequenceadresse: req.body.sequenceadresse,
      codepostalePro: req.body.codepostale,
      role: req.body.role,
      numTier: req.body.numTier,
      typeAdresse: "T",
    };

    logger.info(data4);
    var data2 = {
      differe: req.body.differe,
      besoin: req.body.besoin,
      activite: req.body.activite,
      periodicite: req.body.periodicite,
      nombreecheance: req.body.nombreecheance,
      naturebien: req.body.naturebien,
      bareme: req.body.bareme,
      ville: req.body.ville,
      habitat: req.body.habitat,
      rue: req.body.rue,
      quartier: req.body.quartier,
      montant: req.body.montant,
      numTier: req.body.numTier,
      contratcadre: req.body.contratcadre,
      jourEch: req.body.jourEch,
      datedeblocage: controlDateDebloquage(req.body.datedeb),
      codeGest: req.body.codeGest,
      typeGarantie: req.body.typeGarantie,
      typeGarantie2: req.body.typeGarantie2,
      lienGarantie: req.body.lienGarantie,
      lienGarantie2: req.body.lienGarantie2,
      //sequenceadresse:req.body.sequenceadresse,
      idstatut: 2,
    };

    logger.info(data2);
    var data = {
      differe: req.body.differe,
      codePeriodicite: req.body.periodicite,
      terme: "",
      nbrEcheances: req.body.nombreecheance,
      codeNatBien: req.body.naturebien,
      codeProduit: req.body.produit,
      ContratCadre: req.body.contratcadre,
      jourEcheance: req.body.jourEch,
      codeBareme: req.body.bareme,
      dateDeblocageP: controlDateDebloquage(req.body.datedeb),
      codePDV: req.body.codePDV,
      TypeClient: req.body.activite,
      codeQuartier: req.body.codeQuartier
        ? req.body.codeQuartier
        : req.body.codequartier,
      montantDemande: req.body.montant,
      montantAccorde: req.body.montant,
      numTier: req.body.numTier,
      gestSuivi: req.body.codeGest,
      numTierGarant: req.body.numTierGarant,
      noTiersGarant2: req.body.numTierGarant2,
      Bien: req.body.bien,
      codeMarqueBien: req.body.codeMarqueBien,
      codeBien: "",
      typeGarantie: req.body.typeGarantie,
      typeGarantie2: req.body.typeGarantie2,
      lienGarantie: req.body.lienGarantie,
      lienGarantie2: req.body.lienGarantie2 ? req.body.lienGarantie2 : "",
      montantGarantie2: req.body.montantGarantie2,
      montantGarantie: req.body.montantGarantie,
      codeGest: req.body.codeGest,
      numTiersGroup: "",
      nbrTiers: "",
      numSeq: "",
      numSeq2: "",

      //lienGarantie2:"AMI"
    };

    var data5 = {
      mnttot: req.body.montanttotal,
      numContrat1: req.body.numContrat1,
      numContrat2: req.body.numContrat2 ? req.body.numContrat2 : "",
      differe: req.body.differe,
      codePeriodicite: req.body.periodicite,
      terme: "",
      nbrEcheances: req.body.nombreecheance,
      codeNatBien: req.body.naturebien,
      codeProduit: req.body.produit,
      ContratCadre: req.body.contratcadre,
      jourEcheance: req.body.jourEch,
      codeBareme: req.body.bareme,
      dateDeblocageP: controlDateDebloquage(req.body.datedeb),
      codePDV: req.body.codePDV,
      TypeClient: req.body.activite,
      codeQuartier: req.body.codeQuartier
        ? req.body.codeQuartier
        : req.body.codequartier,
      montantDemande: req.body.montant,
      montantAccorde: req.body.montant,
      numTier: req.body.numTier,
      gestSuivi: req.body.codeGest,
      numTierGarant: req.body.numTierGarant,
      noTiersGarant2: req.body.numTierGarant2,
      Bien: req.body.bien,
      codeMarqueBien: req.body.codeMarqueBien,
      codeBien: "",
      typeGarantie: req.body.typeGarantie,
      typeGarantie2: req.body.typeGarantie2,
      lienGarantie: req.body.lienGarantie,
      lienGarantie2: req.body.lienGarantie2,
      montantGarantie2: req.body.montantGarantie2,
      montantGarantie: req.body.montantGarantie,
      codeGest: req.body.codeGest,
      numTiersGroup: "",
      nbrTiers: "",
      numSeq: "",
      numSeq2: "",
      modeCrea: "C",
      role: "EMP",
      //lienGarantie2:"AMI"
    };
    switch (data5.TypeClient) {
      case "FL":
        data5.TypeClient = "FL";
        break;
      case "SL":
        data5.TypeClient = "SL";
        break;
      case "BL":
        data5.TypeClient = "PB";
        break;
      case "RL":
        data5.TypeClient = "RT";
        break;
      default:
        data5.TypeClient = "ME";
        break;
    }
    logger.info("typeClient : ", data.TypeClient);

    if (data4.sequenceadresse) {
      evolan.updateadresse(data4);
    } else {
      evolan.createadresse(data4);
    }

    var msg = "";
    var annulation = false;
    connection.acquire(function (err, con) {
      closingconnection(con, err, res, () => {
        con.query(
          "update prospectbesoin set ? where numcontrat=? ",
          [data2, data3.numcontrat],
          async function (err, result) {
            logger.info("result modif contrat old", result);

            if (!data3.numcontrat || req.body.naturebien === "CON") {
              reslt =
                req.body.naturebien === "CON"
                  ? await evolan.createContratConso(data5)
                  : await evolan.createContrat(data);
              logger.info("reeee", reslt[0]);
              if (reslt.LIBMSG == "") {
                msg = "Contrat crée avec succés";
              } else {
                msg = reslt.LIBMSG;
                result.msg = msg;
                result.numContrat = reslt.numContrat;

                res.send(result);
              }
            } else if (result.changedRows > 0) {
              reslt = await evolan.createContrat(data);
              logger.info("ddd" + reslt.LIBMSG);
              if (reslt.LIBMSG == "") {
                logger.info("annulation");
                reslt2 = await evolan.annulerContrat(data3);
                logger.info("anulation result", reslt2);
                if (!reslt2.LIBMSG && reslt.numContrat) {
                  msg = "Contrat modifié avec succés";
                  annulation = true;
                } else {
                  msg = "Erreur lors de la modification";
                }
              } else {
                msg = reslt.LIBMSG;
              }
              logger.info("creation: " + reslt);
              logger.info("annulation: " + reslt2);
            } else {
              logger.info("pas de modif");
              msg = "Pas de modification effectuée";
              result.msg = msg;
              res.send(result);
            }

            if (reslt) {
              if (reslt.numContrat) {
                logger.info(annulation);
                if (annulation) {
                  con.query(
                    "update prospectbesoin set numcontrat=?,numcontratOld=? where numcontrat=? ",
                    [reslt.numContrat, data3.numcontrat, data3.numcontrat],
                    function (err, result) {
                      if (result) {
                        // con.query(
                        //   "update prospectbesoingranties set numcontrat=? where numcontrat=? ",
                        //   [reslt.numContrat, data3.numcontrat],
                        //   function (err, result) {}
                        // );
                        result.msg = msg;
                        result.numcontratOld = data3.numcontrat;
                        result.numContrat = reslt.numContrat;
                        res.send(result);
                      } else {
                      }
                    }
                  );
                } else {
                  logger.info(codecontrat);
                  logger.info(12344);
                  con.query(
                    "update prospectbesoin set numcontrat=?,numcontratOld=?,numTier=? where codecontrat=? ",
                    [
                      reslt.numContrat,
                      reslt.numContrat,
                      data.numTier,
                      codecontrat,
                    ],
                    function (err, result) {
                      if (result) {
                        //con.query(
                        // "update prospectbesoingranties set numcontrat=? where codecontrat=? ",
                        // [reslt.numContrat, codecontrat],
                        // function (err, result) {}
                        //);
                        result.msg = msg;
                        result.numcontratOld = reslt.numContrat;
                        result.numContrat = reslt.numContrat;
                        res.send(result);
                      } else {
                      }
                    }
                  );
                }
              } else {
                result.msg = msg;
                result.numContrat = reslt.NOCONT;
                res.send(result);
              }
            } else {
            }
          }
        );
      });
    });
  });
  app.post("/user/check2cin", function (req, res) {
    var data = {
      cin: req.body.cin,
      codeGest: req.body.codeGest,
    };
    var reslt = {};
    connection.acquire(function (err, con) {
      closingconnection(con, err, res, () => {
        con.query(
          "select count(*) as count  from prospect where cin =? ",
          [data.cin],
          async function (err, result) {
            if (result[0].count == 0) {
              reslt = await evolan.findcin(data);
              if (reslt.LIBMSG == "Tiers inexistant") {
                res.send(reslt);
              } else {
                reslt.LIBMSG = "Tiers existant";
                res.send(reslt);
              }
            } else {
              reslt.LIBMSG = "Tiers existant";
              res.send(reslt);
            }
          }
        );
      });
    });
  });

  app.post("/user/getalertes", function (req, res) {
    var idagent = req.body.idagent;
    connection.acquire(function (err, con) {
      closingconnection(con, err, res, () => {
        con.query(
          "select * from taches  where idagent=? and idstatut=1",
          [idagent],
          function (err, result) {
            if (result) {
              res.send(result);
            }
          }
        );
      });
    });
  });

  app.post("/user/getnumTier", function (req, res) {
    var cin = req.body.cin;
    logger.info("DEBUG " + cin);
    connection.acquire(function (err, con) {
      closingconnection(con, err, res, () => {
        con.query(
          "select numTier from prospect  where cin=? ",
          [cin],
          function (err, result) {
            if (result) {
              res.send(result[0]);
            }
          }
        );
      });
    });
  });

  app.post("/user/getlistdossier", function (req, res) {
    var data = {
      codeGest: req.body.codeGest,
      type: req.body.type,
    };
    logger.info(data);
    connection.acquire(function (err, con) {
      closingconnection(con, err, res, () => {
        con.query(
          "select dossier,type,COUNT(*) as count  from contacts  where   codeGest=? and type=?  GROUP BY type,dossier",
          [data.codeGest, data.type],
          function (err, result) {
            if (result) {
              res.send(result);
            }
          }
        );
      });
    });
  });

  app.post("/user/getlistcontact", function (req, res) {
    var codeGest = req.body.id;
    logger.info(codeGest);
    connection.acquire(function (err, con) {
      closingconnection(con, err, res, () => {
        con.query(
          "select * from contacts  where  idstatut=2 and dossier is not null and  codeGest=?  ORDER BY prospect",
          [codeGest],
          function (err, result) {
            if (result) {
              res.send(result);
            }
          }
        );
      });
    });
  });

  app.post("/user/getlistrecs", function (req, res) {
    var data = {
      codeGest: req.body.codeGest,
      start: req.body.start,
      end: req.body.end,
      dossier: req.body.dossier,
      type: req.body.type,
    };
    logger.info(data);
    connection.acquire(function (err, con) {
      closingconnection(con, err, res, () => {
        con.query(
          "select count(*) as count from contacts  where  idstatut>=2 and codeGest=? and type =? and dossier=?  ",
          [data.codeGest, data.type, data.dossier],
          function (err, resultt) {
            if (resultt) {
              logger.info(resultt);
              con.query(
                "select * from contacts  where  idstatut>=2 and codeGest=? and type=? and  dossier=? ORDER BY prospect LIMIT ?, 10 ",
                [data.codeGest, data.type, data.dossier, data.start],
                function (err, result2) {
                  if (result2) {
                    let data = {
                      count: resultt[0].count,
                      result: result2,
                    };

                    res.send(data);
                  }
                }
              );
            }
          }
        );
      });
    });
  });

  app.post("/user/planifierRec", function (req, res) {
    var data = {
      id: req.body.id,
      idstatut: req.body.idstatut,
    };
    logger.info(data);
    connection.acquire(function (err, con) {
      closingconnection(con, err, res, () => {
        con.query(
          "update   contacts set planifier=now(),idstatut=? where   id=? ",
          [data.idstatut, data.id],
          function (err, result) {
            if (result) {
              res.send(result);
            }
          }
        );
      });
    });
  });

  app.post("/user/getdetailcontact", function (req, res) {
    var numTier = req.body.numTier;
    logger.info(numTier);
    connection.acquire(function (err, con) {
      closingconnection(con, err, res, () => {
        con.query(
          "select * from    contacts  where   idstatut>=2 and numTier=? ",
          [numTier],
          function (err, result) {
            if (result) {
              res.send(result);
            }
          }
        );
      });
    });
  });

  app.post("/user/insertgroupeSolidaire", function (req, res) {
    var data = {
      numTier: req.body.numTier,
      cin: req.body.cin,
      gsm: req.body.gsm,
      nom: req.body.nom,
      idprospect: req.body.idprospect,
      idprospectgs: req.body.idgroupe,
      idagent: req.body.idagent,
      cingroupe: req.body.cingroupe,
      montant: req.body.montant,
      differe: req.body.differe,
      periodicite: req.body.periodicite,
      nombreecheance: req.body.nombreecheance,
      naturebien: req.body.naturebien,
      bareme: req.body.bareme,
      contratcadre: req.body.contratcadre,
      jourEch: req.body.jourEch,
      datedeblocage: req.body.datedeblocage,
      produit: req.body.produit,
      codeGest: req.body.codeGest,
    };
    logger.info(data);
    connection.acquire(function (err, con) {
      closingconnection(con, err, res, () => {
        con.query(
          "INSERT INTO prospectgsolidaire set ? ON DUPLICATE KEY UPDATE idprospect=?,cin=?,gsm=?,numTier=?,nom=?,idprospectgs=?,idagent=?,cingroupe=?,montant=?,differe=?,periodicite=?,nombreecheance=?,naturebien=?,bareme=?,contratcadre=?,jourEch=?,datedeblocage=?,produit=?,codeGest=? ",
          [
            data,
            data.idprospect,
            data.cin,
            data.gsm,
            data.numTier,
            data.nom,
            data.idprospectgs,
            data.idagent,
            data.cingroupe,
            data.montant,
            data.differe,
            data.periodicite,
            data.nombreecheance,
            data.naturebien,
            data.bareme,
            data.contratcadre,
            data.jourEch,
            data.datedeblocage,
            data.produit,
            data.codeGest,
          ],
          function (err, result) {
            if (result) {
              res.send(result);
            }
          }
        );
      });
    });
  });

  app.post("/user/getactions", function (req, res) {
    var idagent = req.body.idagent;
    connection.acquire(function (err, con) {
      closingconnection(con, err, res, () => {
        con.query(
          "select * from prospectactions  where idagent=? and idstatut=1",
          [idagent],
          function (err, result) {
            if (result) {
              res.send(result);
            }
          }
        );
      });
    });
  });

  app.post("/user/insertGSEvolan", async function (req, res) {
    var data = {
      differe: req.body.differe,
      codePeriodicite: req.body.periodicite,
      terme: "",
      nbrEcheances: req.body.nombreecheance,
      codeNatBien: req.body.naturebien,
      codeProduit: req.body.produit,
      ContratCadre: req.body.contratcadre,
      jourEcheance: req.body.jourEch,
      codeBareme: req.body.bareme,
      dateDeblocageP: req.body.datedeblocage,
      codePDV: req.body.codePDV,
      TypeClient: "",
      codeQuartier: req.body.codezone,
      montantDemande: req.body.montant,
      montantAccorde: req.body.montant,
      numTier: req.body.numTier,
      gestSuivi: req.body.codeGest,
      numTierGarant: "",
      Bien: req.body.bien,
      codeMarqueBien: req.body.codeMarqueBien,
      codeBien: "",
      typeGarantie: "",
      typeGarantie2: "",
      lienGarantie: "",
      lienGarantie2: "",
      montantGarantie2: "",
      montantGarantie: "",
      codeGest: req.body.codeGest,
      numTiersGroup: req.body.numTiersGroup,
      nbrTiers: req.body.nbrTiers,

      //lienGarantie2:"AMI"
    };

    reslt = await evolan.createContrat(data);
  });

  app.post("/user/callfindgroupsolidaire", function (req, res) {
    var nom = req.body.nom;
    logger.info(nom);
    connection.acquire(function (err, con) {
      closingconnection(con, err, res, () => {
        con.query(
          'select * from prospect  where nom=? and role="GS"',
          [nom],
          function (err, result) {
            if (result) {
              logger.info(result);
              if (result[0]) {
                con.query(
                  "select p.*,gs.idprospectgs as idgroupe ,gs.prospectgs  as prospectgs, gs.id as idprospectgsolidaire,gs.montant,gs.differe,gs.periodicite,gs.nombreecheance,gs.naturebien,gs.bareme,gs.contratcadre,gs.jourEch,gs.datedeblocage,gs.produit,gs.codeGest,g.numContrat  from prospectgsolidaire gs,prospect p where gs.cingroupe=? and gs.idprospect=p.id",
                  [result[0].cin],
                  function (err, result2) {
                    if (result2) {
                      let data = {
                        groupe: result[0],
                        membres: result2,
                      };
                      res.send(data);
                    }
                  }
                );
              } else {
                let data = {};
                res.send(data);
              }
            } else {
            }
          }
        );
      });
    });
  });

  app.post("/user/insertPosition", function (req, res) {
    var gps = {
      contexte: req.body.contexte,
      lat: req.body.lat,
      lag: req.body.lag,
      idagent: req.body.idagent,
      agent: req.body.agent,
      agence: req.body.agence,
      cin: req.body.cin,
    };
    logger.info(gps);
    callGPS(gps, res);
    res.send({
      message: 200,
    });
  });

  app.post("/user/getged", function (req, res) {
    var id = req.body.id;
    logger.info(id);
    connection.acquire(function (err, con) {
      closingconnection(con, err, res, () => {
        con.query(
          "select * from  ged where cin=?  ",
          [id],
          function (err, result) {
            res.send(result);
          }
        );
      });
    });
  });

  app.post("/user/getprospectbesoinserver", function (req, res) {
    var id = req.body.id;
    logger.info(id);
    connection.acquire(function (err, con) {
      closingconnection(con, err, res, () => {
        con.query(
          "select * from prospectbesoin  where cin=? and idstatut>2 and numcontrat is null ",
          [id],
          function (err, result) {
            if (result) {
              res.send(result);
            }
          }
        );
      });
    });
  });

  app.post("/user/annulerprospectbesoin", function (req, res) {
    var id = req.body.id;

    connection.acquire(function (err, con) {
      closingconnection(con, err, res, () => {
        con.query(
          "update  prospectbesoin set idstatut=-1  where id=?",
          [id],
          function (err, result) {
            if (result) {
              res.send(result);
            }
          }
        );
      });
    });
  });

  app.post("/user/insertprospect", function (req, res) {
    var cin = req.body.cin;

    connection.acquire(function (err, con) {
      closingconnection(con, err, res, () => {
        con.query(
          "insert into  prospect set cin=? ON DUPLICATE KEY UPDATE idstatut=idstatut",
          [cin],
          function (err, result) {
            if (result) {
              con.query(
                "select * from  prospect where  cin=? ",
                [cin],
                function (err, result) {
                  if (result) {
                    if (result.length > 0) {
                      let reslt = result[0];
                      reslt.insertId = reslt.id;

                      res.send(reslt);
                    }
                  }
                }
              );
            }
          }
        );
      });
    });
  });

  app.post("/user/updatealerteserver", function (req, res) {
    var data = {
      id: req.body.idserver,
      action: req.body.action,
      commentaire: req.body.commentaire,
    };

    connection.acquire(function (err, con) {
      closingconnection(con, err, res, () => {
        con.query(
          "update taches set action=?,commentaire=?,maj=0,idstatut=2  where id=? ",
          [data.action, data.commentaire, data.id],
          function (err, result) {
            if (result) {
              res.send(result);
            }
          }
        );
      });
    });
  });

  app.post("/user/updateactionserver", function (req, res) {
    var data = {
      id: req.body.idserver,
      typeresultat: req.body.typeresultat,
      commentaire: req.body.commentaire,
      dateactionexecute: req.body.dateexcution,
    };

    connection.acquire(function (err, con) {
      closingconnection(con, err, res, () => {
        con.query(
          "update prospectactions set typeresultat=?,commentaire=?,dateactionexecute=? ,maj=0,idstatut=2  where id=? ",
          [
            data.typeresultat,
            data.commentaire,
            data.dateactionexecute,
            data.id,
          ],
          function (err, result) {
            if (result) {
              res.send(result);
            }
          }
        );
      });
    });
  });

  app.post("/user/inserttprospectserver", async function (req, res) {
    var role = req.body.role;
    var datecinexp = req.body.datecinexp;
    logger.info("------role--------", role);
    if (role == "PRO" && datecinexp != null) {
      let result = await callTier(req, res);
      res.send(result);
    } else if (role == "EMP") {
      let result = await callTier(req, res);
      res.send(result);
    } else if (role == "GAR") {
      let result = await callGarant(req, res);
      res.send(result);
    } else if (role == "GS") {
      let result = await callSolidaire(req, res);
      res.send(result);
    } else if (role == "PRO" && datecinexp == null) {
      let result = await callprospect(req, res);
      res.send(result);
    }
  });

  function callprospect(req, res) {
    return new Promise((resolve, reject) => {
      var type = req.body.type;
      var cin = req.body.cin;
      var id = req.body.idserver;
      logger.info("le id pro:" + id);

      var data = {
        nom: req.body.nom,
        prenom: req.body.prenom,
        titre: req.body.titre,
        prefixe: req.body.prefixe,
        canal: req.body.canal,
        ville: req.body.ville,
        codepostale: req.body.codepostale,
        habita: req.body.habita,
        lieurencontre: req.body.lieurencontre,
        rue: req.body.rue,
        quartier: req.body.quartier,
        photoProfil: req.body.photo,
        cinR: req.body.cinRecto,
        cinV: req.body.cinVerso,
        idagent: req.body.idagent,
        agent: req.body.agent,
        situationFamilliale: req.body.situation,
        codeActivite: req.body.activite,
        gsm: req.body.gsm,
        role: req.body.role,
        pays: req.body.pays,
        numTier: req.body.numTier,
        cin: req.body.cin,
        codeGest: req.body.codeGest,
        horizon: req.body.horizon,
        origine: req.body.origine,
        secteur: req.body.secteur,
      };
      if (!req.body.cinRecto) {
        delete data.cinR;
      }
      if (!req.body.cinVerso) {
        delete data.cinV;
      }
      if (!req.body.photo) {
        delete data.photoProfil;
      }
      logger.info("daaata ------", data);
      var dnaissance = "";
      if (data.dnaissance) {
        dnaissance = moment(data.dnaissance, "YYYY-MM-DD");
        dnaissance = dnaissance.format("YYYYMMDD");
      }
      connection.acquire(function (err, con) {
        closingconnection(con, err, res, () => {
          con.query(
            "update  prospect set ? where id=? ",
            [data, id],
            async function (err, result) {
              if (result) {
                var n = cin.startsWith("#");
                if (n == true) {
                  return resolve(result);
                } else {
                  logger.info("type" + type);
                  data.cin = cin;
                  data.dnaissance = dnaissance;
                  if (type == "update") {
                    let reslt2 = await evolan.editprospect(data);
                    return resolve(result);
                  } else {
                    let reslt = await evolan.createProspect(data);
                    logger.info(
                      "error création",
                      reslt.LIBMSG.length,
                      !reslt.NOTIER
                    );

                    if (reslt) {
                      logger.info("fff: " + id);
                      if (!reslt.NOTIER && reslt.LIBMSG.length > 1) {
                        reslt.NOTIER = null;
                        logger.info("error création", reslt.LIBMSG);
                        return resolve({
                          msg: "error création" + reslt.LIBMSG,
                        });
                      } else {
                        con.query(
                          "update  prospect set numTier=?,LIBMSG=? where id=? ",
                          [reslt.NOTIER, reslt.LIBMSG, id],
                          function (err, result) {
                            logger.info(result);
                            if (result) {
                              if (
                                reslt.NOTIER &&
                                data.horizon &&
                                type != "update"
                              ) {
                                logger.info(3333333333333);
                                var numWeeks = parseInt(data.horizon);

                                var dte = Date.now();

                                var datecontact = moment(dte);
                                datecontact.add(numWeeks, "week");
                                datecontact = datecontact.format("YYYYMMDD");
                                var object = {
                                  codeGest: req.body.codeGest,
                                  typeContact: "P",
                                  numTier: reslt.NOTIER,
                                  CodeMotif: "011",
                                  LibMotif: "Prospection",
                                  CodeSupport: "13",
                                  LibSupport: "Visite",
                                  datecont: datecontact,
                                  heureContact: "09000000",
                                  role: "PRO",
                                };
                                logger.info(object);

                                let r = evolan.createcontactProspect(object);
                                logger.info(
                                  "result createcontact prospection",
                                  r
                                );
                              }
                              logger.info(result);
                              return resolve(result);
                            } else {
                            }
                          }
                        );
                      }
                    } else {
                      logger.info("error creation du prospect");
                      return resolve({ msg: "error création" });
                    }
                  }
                }
              } else {
              }
            }
          );
        });
      });
    });
  }

  function callSolidaire(req, res) {
    return new Promise((resolve, reject) => {
      var type = req.body.type;
      var cin = req.body.cin;
      var id = req.body.idserver;

      var data = {
        nom: req.body.nom,
        prefixe: req.body.prefixe,
        ville: req.body.ville,
        codepostale: req.body.codepostale,
        habita: req.body.habita,
        rue: req.body.rue,
        quartier: req.body.quartier,
        idagent: req.body.idagent,
        agent: req.body.agent,
        gsm: req.body.gsm,
        role: req.body.role,
        pays: req.body.pays,
        numTier: req.body.numTier,
        cin: req.body.cin,
      };

      connection.acquire(function (err, con) {
        closingconnection(con, err, res, () => {
          con.query(
            "update  prospect set ? where id=? ",
            [data, id],
            async function (err, result) {
              if (result) {
                var n = cin.startsWith("#");

                if (n == true) {
                  return resolve(result);
                } else {
                }
              } else {
              }
            }
          );
        });
      });
    });
  }

  function callTier(req, res) {
    return new Promise((resolve, reject) => {
      var type = req.body.type;
      logger.info("type", type);
      var cin = req.body.cin;
      var id = req.body.idserver;
      var canal = req.body.canal;
      var gps = {
        contexte: "Tiers",
        typeaction: "update",
        lat: req.body.lat,
        lag: req.body.lag,
        idagent: req.body.idagent,
        agent: req.body.agent,
        cin: cin,
      };
      var data = {
        nom: req.body.nom,
        prenom: req.body.prenom,
        dnaissance: req.body.dnaissance,
        titre: req.body.titre,
        canal: req.body.canal,
        ville: req.body.ville,
        codepostale: req.body.codepostale,
        habita: req.body.habita,
        rue: req.body.rue,
        quartier: req.body.quartier,
        photoProfil: req.body.photo,
        cinR: req.body.cinRecto,
        cinV: req.body.cinVerso,
        idagent: req.body.idagent,
        agent: req.body.agent,
        situationFamilliale: req.body.situation,
        codeActivite: req.body.activite,
        gsm: req.body.gsm,
        gsm2: req.body.gsm2,
        role: req.body.role,
        pays: req.body.pays,
        datecinexp: req.body.datecinexp,
        justif: req.body.justif,
        niveauetude: req.body.niveauetude,
        typelocal: req.body.typelocal,
        rib: req.body.rib,
        lieudenaissance: req.body.lieudenaissance,
        ancienrole: req.body.ancienrole,
        codeGest: req.body.codeGest,
        origine: req.body.origine,
        secteur: req.body.secteur,
        bidonville: req.body.bidonville,
        createUpdate: req.body.createUpdate, // Ajout Rib
      };
      if (!req.body.cinRecto) {
        delete data.cinR;
      }
      if (!req.body.cinVerso) {
        delete data.cinV;
      }
      if (!req.body.photo) {
        delete data.photoProfil;
      }
      logger.info("daaata ------", data);
      var cindateexpiration = "";
      var dnaissance = "";
      if (data.dnaissance) {
        dnaissance = moment(data.dnaissance, "YYYY-MM-DD");
        dnaissance = dnaissance.format("YYYYMMDD");
      }

      if (data.datecinexp) {
        cindateexpiration = moment(data.datecinexp, "YYYY-MM-DD");
        cindateexpiration = cindateexpiration.format("YYYYMMDD");
      }

      var codebq = data?.rib?.substring(0, 3);
      var codeguichet = data?.rib?.substring(3, 6);
      var compte = data.rib?.substring(6, 22);
      var cle = data.rib?.substring(22, 24);
      var zoneUR = data.justif?.substring(0, 2);
      var zone = data.justif?.substring(2, 6);
      logger.info("here");
      logger.info(data);
      connection.acquire(function (err, con) {
        closingconnection(con, err, res, () => {
          con.query(
            "update  prospect set ? where id=? ",
            [data, id],
            async function (err, result) {
              if (result.changedRows > 0) {
                data.numTier = req.body.numTier;
                //callGPS(gps);
                if (cin.startsWith("#")) {
                  return resolve(result);
                } else {
                  data.cin = cin;
                  data.dnaissance = dnaissance;
                  data.codebq = codebq;
                  data.codeguichet = codeguichet;
                  data.cindateexpiration = cindateexpiration;
                  data.compte = compte;
                  data.cle = cle;
                  data.zoneUR = zoneUR;
                  data.zone = zone;
                  logger.info(data);
                  if (type == "update") {
                    con.query(
                      "select * from prospectrole where numTier=? ",
                      [data.numTier],
                      async function (err, result2) {
                        if (result2) {
                          logger.info("les role" + result2);
                          if (canal && canal != "undefined") {
                            data.canal = canal;
                          } else {
                            data.canal = "";
                          }

                          data.role = result2[0].role;
                          let reslt2 = await evolan.edittiers(data);
                          if (reslt2) {
                            con.query(
                              "update  prospect set LIBMSG=? where numTier=? ",
                              [reslt2[0].LIBMSG, data.numTier],
                              function (err, result) {
                                if (result) {
                                  return resolve(result);
                                }
                              }
                            );
                          } else {
                            return resolve({ msg: "error modification tiers" });
                          }
                        } else {
                        }
                      }
                    );
                  } else {
                    logger.info("creation tiers");
                    let reslt = await evolan.createTiers(data);
                    if (reslt) {
                      if (!reslt.NOTIER) {
                        reslt.NOTIER = null;
                      }
                      con.query(
                        "update  prospect set numTier=?,LIBMSG=? where id=? ",
                        [reslt.NOTIER, reslt.LIBMSG, id],
                        function (err, result) {
                          if (result) {
                            return resolve(result);
                          }
                        }
                      );
                    } else {
                      return resolve({ msg: "error création tiers" });
                    }
                  }
                }
              } else {
                return resolve(result);
              }
            }
          );
        });
      });
    });
  }

  function callGarant(req, res) {
    return new Promise((resolve, reject) => {
      var type = req.body.type;
      var cin = req.body.cin;
      var id = req.body.idserver;
      var gps = {
        contexte: "GARANT",
        typeaction: "update",
        lat: req.body.lat,
        lag: req.body.lag,
        idagent: req.body.idagent,
        agent: req.body.agent,
        cin: cin,
      };
      var data = {
        nom: req.body.nom,
        prenom: req.body.prenom,
        dnaissance: req.body.dnaissance,
        titre: req.body.titre,
        prefixe: req.body.prefixe,
        age: req.body.age,
        ville: req.body.ville,
        codepostale: req.body.codepostale,
        habita: req.body.habita,
        rue: req.body.rue,
        quartier: req.body.quartier,
        photoProfil: req.body.photo,
        cinR: req.body.cinRecto,
        cinV: req.body.cinVerso,
        idagent: req.body.idagent,
        agent: req.body.agent,
        codeActivite: req.body.activite,
        gsm: req.body.gsm,
        gsm2: req.body.gsm2,
        role: req.body.role,
        pays: req.body.pays,
        datecinexp: req.body.datecinexp,
        numTier: req.body.numTier,
        codeGest: req.body.codeGest,
      };
      var cindateexpiration = "";
      var dnaissance = "";
      if (data.dnaissance) {
        dnaissance = moment(data.dnaissance, "YYYY-MM-DD");
        dnaissance = dnaissance.format("YYYYMMDD");
      }

      if (data.datecinexp) {
        cindateexpiration = moment(data.datecinexp, "YYYY-MM-DD");
        cindateexpiration = cindateexpiration.format("YYYYMMDD");
      }
      connection.acquire(function (err, con) {
        closingconnection(con, err, res, () => {
          con.query(
            "update  prospect set ? where id=? ",
            [data, id],
            async function (err, result) {
              if (result) {
                callGPS(gps);
                if (cin.startsWith("#")) {
                  return resolve(result);
                } else {
                  data.cin = cin;
                  data.dnaissance = dnaissance;
                  data.cindateexpiration = cindateexpiration;

                  if (type == "update") {
                    let reslt2 = await evolan.editGarant(data);
                    return resolve(result);
                  } else {
                    let reslt = await evolan.createGarant(data);
                    if (reslt.NOTIER) {
                      con.query(
                        "update  prospect set numTier=? where id=? ",
                        [reslt.NOTIER, id],
                        function (err, result) {
                          if (result) {
                            return resolve(result);
                          }
                        }
                      );
                    } else {
                    }
                  }
                }
              } else {
              }
            }
          );
        });
      });
    });
  }

  // ---- get position agence from simulator app
  app.post("/user/positionGPS", function (req, res) {
    var data = {
      lat: req.body.lat,
      long: req.body.long,
      evt: req.body.evt,
      agence: req.body.agence,
    };
    logger.info("----- gps data : ", data);
    connection.acquire(function (err, con) {
      closingconnection(con, err, res, () => {
        con.query(
          `select codeGest from positiongps where agence = '${agence}'; `,
          function (error, results, fields) {
            if (error) {
              logger.info(error);
            } else {
              con.query(
                "insert into  positiongps set latitde=?,longitude=?,evenement=?,agence=?, datecapture=?",
                [data.lat, data.long, data.evt, data.agence, new Date()],
                function (err, result) {
                  res.status(200).send("");
                }
              );
            }
          }
        );
      });
    });
  });
  // ---- end

  function callGPS(gps, res) {
    // anomalie corrigée 01/07/2022 (requette ne s'execute pas) 
    connection.acquire(function (err, con) {
      closingconnection(con, err, res, () => {
        con.query(`insert into positiongps (latitde,longitude,idagent,agent,typeaction,cin,evenement,device,datecapture) values ("${gps.lat}","${gps.lag}",${gps.idagent},"${gps.agent}","${gps.typeaction}","${gps.cin}","${gps.contexte}","${gps.agence}",now()) `, function (error, resultat) {
          if (error) {
            logger.info(gps, "ERROR Inserting GPS:", error);
          } else {
            logger.info(gps, " Inserted ID ", resultat.insertId);
          }
        }
        );
      });
    });
  }

  app.post("/user/inserttprospectbesoinserver", function (req, res) {
    var data = {
      montant: req.body.montant,
      horizon: req.body.horizon,
      idagent: req.body.idagent,
      agent: req.body.agent,
      radicale: req.body.radicale,
      cin: req.body.cin,
      activite: req.body.activite,
      besoin: req.body.besoinfinancement,
      nombreecheance: req.body.nombreecheance,
      idprospect: req.body.idprospect,
      datedeblocage: req.body.datedeblocage,
      periodicite: req.body.periodicite,
      codequartier: req.body.codezone,
      codePDV: req.body.codePDV,
      jourEch: req.body.jourEch,
      rue: req.body.rue,
      habitat: req.body.habitat,
      quartier: req.body.quartier,
      ville: req.body.ville,
      codepostale: req.body.codepostale,
      codecontrat: req.body.codecontrat,
      codeGest: req.body.codeGest,
      type: req.body.type,
      secteur: req.body.secteur,
      idstatut: 3,
      sequenceadresse: req.body.sequenceadresse,
    };

    logger.info(data);
    connection.acquire(function (err, con) {
      closingconnection(con, err, res, () => {
        con.query(
          "INSERT INTO prospectbesoin set ? ON DUPLICATE KEY UPDATE montant=?,horizon=?,idagent=?,agent=?,radicale=?,cin=?,activite=?,besoin=?,nombreecheance=?,idprospect=?,datedeblocage=?,periodicite=?,codequartier=?,rue=?,habitat=?,quartier=?,ville=?,codecontrat=?,idstatut=?,jourEch=?,codePDV=?,codeGest=?,type=?,secteur=?,sequenceadresse=? ",
          [
            data,
            data.montant,
            data.horizon,
            data.idagent,
            data.agent,
            data.radicale,
            data.cin,
            data.activite,
            data.besoin,
            data.nombreecheance,
            data.idprospect,
            data.datedeblocage,
            data.periodicite,
            data.codequartier,
            data.rue,
            data.habitat,
            data.quartier,
            data.ville,
            data.codecontrat,
            data.idstatut,
            data.jourEch,
            data.codePDV,
            data.codeGest,
            data.type,
            data.secteur,
            data.sequenceadresse,
          ],
          function (err, result) {
            if (result) {
              res.send(result);
            }
          }
        );
      });
    });
  });

  app.post("/user/insertproModifnserver", function (req, res) {
    var data = {
      nom: req.body.nom,
      prenom: req.body.prenom,
      idagent: req.body.idagent,
      agent: req.body.agent,
      radicale: req.body.prefixe,
      cin: req.body.cin,
      idprospect: req.body.idprospect,
      datenaissance: req.body.dnaissance,
      cinavant: req.body.cinavant,
      prospect: req.body.info,
    };

    connection.acquire(function (err, con) {
      closingconnection(con, err, res, () => {
        con.query(
          "insert into  prospectmodification set ?",
          data,
          function (err, result) {
            if (result) {
              res.send(result);
            }
          }
        );
      });
    });
  });

  app.post("/user/getcentralerisque", async function (req, res) {
    var data = {
      cin: req.body.cin,
      codeGest: req.body.codeGest,
    };

    let reslt = await evolan.consulterCRisque(data);
    res.send(reslt);
  });

  app.post("/user/lancerrapport", async function (req, res) {
    var data = {
      codeGest: "COE",
      numContrat: "00005474614",
    };

    let reslt = await evolan.lancerRappSolvabilite(data);
    res.send(reslt);
  });
  app.post("/user/consulterRappSolvabilite", async function (req, res) {
    var data = {
      CDGSTR: req.body.codeGest,
      CIN: req.body.cin,
    };
    let soapRib = require("soap");
    return new Promise((resolve, reject) => {
      soapRib.createClient(process.env.JAVA_WS_URL, (err, clienJava) => {
        if (err) logger.info(" ***** Error Calling consulterRS ****", err);
        clienJava.consulterRS(data, function (err, result) {
          if (err) logger.info(" ***** Error Calling consulterRS ****", err);
          logger.info(resp);
          let resp = JSON.parse(result?.return).filter((e, ind) => ind != 3);
          logger.info(resp);
          resp[1] = resp[1].map((e) => ({
            banque: e.ACIDSUB,
            nbrEch: e.ACINSTTOTN,
            montantCredit: (
              parseInt(e.ACINSTTOTN) * parseInt(e.AHINSTAMNT)
            ).toString(),
            dateFinPrevue: e.ACCLODTEST,
            dateFin: e.ACCLODT,
            montantEch: e.AHINSTAMNT,
            statut: e.AHPAYSTAT,
            dateDeblocage:
              e.ACFINDT != "null"
                ? moment(e.ACFINDT, "YYYY/MM/DD").format("YYYY/MM/DD")
                : "null",
            nbrEchRest: e.AHINSTDUEN,
            montantRest: e.AHBAL,
            nbrEchIMP: e.AHINSTARRN,
            montantImp: (
              parseInt(e.AHINSTARRN) * parseInt(e.AHINSTAMNT)
            ).toString(),
            nbrEchRetard: e.AHNBRRET,
            type:
              e.APPTYPE == "Garant, caution"
                ? "GAR"
                : e.APPTYPE == "Principal"
                  ? "PRI"
                  : "AUTRE",
          }));
          resp[2] = resp[2].map((e) => ({
            banque: e.NIIDSUB,
            type: e.NITYP,
            dateDeclaration: e.NIDT,
            dateMaj: e.LSTPROCESS,
            dateSortie: e.NICLOSEDT,
            montant: e.NIAMNT,
          }));
          res.send(resp);
        });
      });
    });

    let reslt = await evolan.consulterRappSolvabilite(data);
    logger.info("/user/consulterRappSolvabilite", reslt);
    res.send(JSON.parse(reslt));
  });
  app.post("/user/consulterrapport", async function (req, res) {
    var cin = req.body.cin;

    logger.info(cin);
    let reslt = await evolan.consulterRappSolvabilite(cin);
    res.send(reslt);
  });

  app.post("/user/getprospectInfo", async function (req, res) {
    var data = {
      numTier: req.body.numTier,
      codeGest: req.body.codeGest,
      cin: req.body.cin,
    };

    var metier = req.body.codeActivite;

    let reslt = await evolan.contratsByNumTiers(data);

    // ********* filtrer les contrats AFC  ********
    if (reslt.EMP.Demande.length > 0) reslt.EMP.Demande = reslt.EMP.Demande.filter(demande => demande.statut != "AFC")
    // *********  ************************  ********

    if (reslt.EMP.Demande.length > 0) {
      let demande = reslt.EMP.Demande[0];
      var data2 = {
        nombreecheance: demande.NbrEcheances,
        cin: data.cin,
        numcontrat: demande.numContrat,
        numTier: data.numTier,
        produit: demande.codeProduit,
        natureBien: demande.natureBien,
        montant: demande.montantDem,
        periodicite: demande.CodePeriodicite,
        jourEch: demande.JourEcheance,
        bareme: demande.CodeBareme,
        statut: demande.statut,
        situation: demande.Situation,
        differe: demande.differe,
        datedeblocage: demande.dateDeblocagePrevue,
        besoin: demande.codeBesoin,
        idstatut: 2,
        codeGest: data.codeGest,
      };
      data2.nombreecheance = parseInt(data2.nombreecheance);
      data2.differe = parseInt(data2.differe);
      data2.montant = parseFloat(data2.montant);
      if (data2.datedeblocage !== "00000000") {
        data2.datedeblocage = moment(data2.datedeblocage, "YYYYMMDD");
        data2.datedeblocage = data2.datedeblocage.format("YYYY-MM-DD");
      } else {
        data2.datedeblocage = null;
      }
      logger.info(data2);
      connection.acquire(function (err, con) {
        closingconnection(con, err, res, () => {
          con.query(
            "INSERT INTO prospectbesoin set ? ON DUPLICATE KEY UPDATE nombreecheance=?,codeGest=?,numTier=?,cin=?,numcontrat=?,produit=?,periodicite=?,jourEch=?,bareme=?,statut=?,situation=?,differe=?,datedeblocage=?,natureBien=?,montant=?,besoin=?,idstatut=2",
            [
              data2,
              data2.nombreecheance,
              data2.codeGest,
              data2.numTier,
              data2.cin,
              data2.numcontrat,
              data2.produit,
              data2.periodicite,
              data2.jourEch,
              data2.bareme,
              data2.statut,
              data2.situation,
              data2.differe,
              data2.datedeblocage,
              data2.natureBien,
              data2.montant,
              data2.besoin,
            ],
            function (err, result) {
              logger.info(result);
              if (result) {
                con.query(
                  "select * from prospectbesoin where numcontrat =?",
                  [data2.numcontrat],
                  function (err, result) {
                    logger.info(result[0].activite);
                    if (result.length > 0) {
                      if (result[0].activite) {
                        reslt.EMP.Demande[0].activite = result[0].activite;
                        reslt.EMP.Demande[0].secteur = result[0].secteur;
                      } else {
                        reslt.EMP.Demande[0].activite = metier;
                      }
                      reslt.EMP.Demande[0].codecontrat = result[0].codecontrat;
                    } else {
                      reslt.EMP.Demande[0].activite = metier;
                    }
                    res.send(reslt);
                  }
                );
              } else {
              }
            }
          );
        });
      });
    } else {
      res.send(reslt);
    }
  });

  app.post("/user/getriblist", function (req, res) {
    var id = req.body.id;

    connection.acquire(function (err, con) {
      closingconnection(con, err, res, () => {
        con.query(
          "select * from prospectrib where idprospect=?",
          [id],
          function (err, result) {
            if (result) {
              res.send(result);
            }
          }
        );
      });
    });
  });

  app.post("/user/checkCIN", async function (req, res) {
    var cin = req.body.cin;
    var type = req.body.type;

    let result = await callfindCIN(req, res);
    res.send(result);
  });

  function callfindCINGarant(req, res) {
    var newArrayDataOfOjbect;
    var val = req.body.val;
    var data = {
      val: req.body.val,
      codeGest: req.body.codeGest,
    };
    return new Promise((resolve, reject) => {
      connection.acquire(function (err, con) {
        closingconnection(con, err, res, () => {
          con.query(
            "  select count(*) as count  from prospect where cin =?  ",
            [data.val],
            async function (err, result) {
              if (result[0].count == 0) {
                let reslt = await evolan.findcin(data);

                if (reslt) {
                  if (reslt.LIBMSG == "Tiers inexistant") {
                    return resolve(reslt);
                  } else if (reslt.numTier) {
                    logger.info(reslt.role);
                    var obj = reslt.role;
                    newArrayDataOfOjbect = Object.keys(obj).map(function (key) {
                      return obj[key];
                    });
                    logger.info("array:" + newArrayDataOfOjbect);

                    if (reslt.dateNaiss !== "00000000") {
                      var dnaissance = moment(reslt.dateNaiss, "YYYYMMDD");
                      dnaissance = dnaissance.format("YYYY-MM-DD");
                    } else {
                      var dnaissance = null;
                    }

                    if (reslt.dateExpCIN !== "00000000") {
                      var dateExpCIN = moment(reslt.dateExpCIN, "YYYYMMDD");
                      dateExpCIN = dateExpCIN.format("YYYY-MM-DD");
                    } else {
                      var dateExpCIN = null;
                    }

                    var rib =
                      "" +
                      reslt.code_Bq +
                      "" +
                      reslt.code_G +
                      "" +
                      reslt.num_compt +
                      "" +
                      reslt.numRIB;
                    var justif = "" + reslt.zoneUR + "" + reslt.zone;
                    var data = {
                      numTier: reslt.numTier,
                      //role:reslt.role,
                      nom: reslt.nom,
                      titre: reslt.titre,
                      habita: reslt.habitat,
                      rue: reslt.rue,
                      datecinexp: dateExpCIN,
                      cin: reslt.cin,
                      quartier: reslt.quartier,
                      prenom: reslt.prenom,
                      codepostale: reslt.codePostal,
                      ville: reslt.ville,
                      gsm2: reslt.tel,
                      gsm: reslt.gsm,
                      canal: reslt.canal,
                      codeActivite: reslt.codeActivite,
                      rib: rib,
                      justif: justif,
                      dnaissance: dnaissance,
                      situationFamilliale: reslt.etat_civil,
                      niveauetude: reslt.niv_etude,
                      lieudenaissance: reslt.lieu_naissance,
                    };

                    logger.info(data);
                    con.query(
                      "insert into  prospect set ? ",
                      data,
                      function (err, result) {
                        var datt = {
                          id: result.insertId,
                          numTier: data.numTier,
                        };
                        var obj = {};
                        var list = [];
                        for (var i = 0; i < newArrayDataOfOjbect.length; i++) {
                          obj = {};
                          obj.role = newArrayDataOfOjbect[i];
                          obj.idprospect = result.insertId;
                          obj = Object.values(obj);
                          list.push(obj);
                        }
                        //newArrayDataOfOjbect.push(result.insertId);
                        callloopinsertroles(list, res);
                        data.id = result.insertId;

                        return resolve(data);
                      }
                    );
                  } else {
                  }
                } else {
                }
              } else {
                con.query(
                  "select * from prospect where cin=? or numTier=? ",
                  [val, val],
                  function (err, result) {
                    if (result.length > 0) {
                      return resolve(result[0]);
                    }
                  }
                );
              }
            }
          );
        });
      });
    });
  }

  async function callfindTiers(datta, res) {
    var newArrayDataOfOjbect;
    let val = datta.val;
    let reslt;
    reslt = await evolan.findnumTier(datta);
    return new Promise((resolve, reject) => {
      if (reslt) {
        if (reslt.LIBMSG == "Tiers inexistant") {
          return resolve(reslt);
        } else if (reslt.numTier) {
          var obj = reslt.role;
          newArrayDataOfOjbect = Object.keys(obj).map(function (key) {
            return obj[key];
          });
          logger.info("array:" + newArrayDataOfOjbect[0]);

          if (reslt.dateNaiss !== "00000000") {
            var dnaissance = moment(reslt.dateNaiss, "YYYYMMDD");
            dnaissance = dnaissance.format("YYYY-MM-DD");
          } else {
            var dnaissance = null;
          }

          if (reslt.dateExpCIN !== "00000000") {
            var dateExpCIN = moment(reslt.dateExpCIN, "YYYYMMDD");
            dateExpCIN = dateExpCIN.format("YYYY-MM-DD");
          } else {
            var dateExpCIN = null;
          }
          logger.info("codeg:" + reslt.code_G);
          logger.info("compte:" + reslt.num_compt);
          var rib =
            "" +
            reslt.code_Bq +
            "" +
            reslt.code_G +
            "" +
            reslt.num_compt +
            "" +
            reslt.numRIB;
          var justif = "" + reslt.zoneUR + "" + reslt.zone;
          var data = {
            numTier: reslt.numTier,
            nom: reslt.nom,
            titre: reslt.titre,
            habita: reslt.habitat,
            rue: reslt.rue,
            datecinexp: dateExpCIN,
            cin: reslt.cin,
            quartier: reslt.quartier,
            prenom: reslt.prenom,
            codepostale: reslt.codePostal,
            ville: reslt.ville,
            gsm2: reslt.tel,
            gsm: reslt.gsm,
            canal: reslt.canal,
            codeActivite: reslt.codeActivite,
            rib: rib,
            justif: justif,
            typelocal: reslt.typeLocal,
            dnaissance: dnaissance,
            situationFamilliale: reslt.etat_civil,
            niveauetude: reslt.niv_etude,
            lieudenaissance: reslt.lieu_naissance,
            codeGest: reslt.codeGest,
            origine: reslt.origine,
            secteur: reslt.secteur,
          };

          logger.info(data);
          connection.acquire(function (err, con) {
            closingconnection(con, err, res, () => {
              con.query(
                "insert into  prospect set ? ON DUPLICATE KEY UPDATE nom=?,titre=?,habita=?,rue=?,datecinexp=?,typelocal=?,quartier=?,prenom=?,codepostale=?,ville=?,gsm2=?,gsm=?,canal=?,codeActivite=?,justif=?,dnaissance=?,situationFamilliale=?,niveauetude=?,lieudenaissance=? ,origine=?,rib=?,secteur=?",
                [
                  data,
                  data.nom,
                  data.titre,
                  data.habita,
                  data.rue,
                  data.datecinexp,
                  data.typelocal,
                  data.quartier,
                  data.prenom,
                  data.codepostale,
                  data.ville,
                  data.gsm2,
                  data.gsm,
                  data.canal,
                  data.codeActivite,
                  data.justif,
                  data.dnaissance,
                  data.situationFamilliale,
                  data.niveauetude,
                  data.lieudenaissance,
                  data.origine,
                  data.rib,
                  data.secteur,
                ],
                function (err, result) {
                  if (result) {
                    con.query(
                      "select * from prospect where cin =? ",
                      [data.cin],
                      function (err, result2) {
                        if (result2) {
                          logger.info("list" + result2[0].id);
                          if (result2.length > 0) {
                            var datt = {
                              id: result2[0].id,
                              numTier: data.numTier,
                            };
                            var obj = {};
                            var list = [];
                            for (
                              var i = 0;
                              i < newArrayDataOfOjbect.length;
                              i++
                            ) {
                              obj = {};
                              obj.role = newArrayDataOfOjbect[i];
                              obj.numTier = data.numTier;
                              obj = Object.values(obj);
                              list.push(obj);
                            }
                            callloopinsertroles(list, res);
                            data.id = result2[0].id;
                            data.photoProfil = result2[0].photoProfil;
                            data.cinR = result2[0].cinR;
                            data.cinV = result2[0].cinV;
                            data.listaddresse = reslt.addresse;
                            data.listrole = reslt.role;
                            return resolve(data);
                          }
                        } else {
                        }
                      }
                    );
                  } else {
                  }
                }
              );
            });
          });
        }
      } else {
        reslt.LIBMSG == "Erreur! Veuillez réessayer plus tard";
        return resolve(reslt);
      }
    });
  }

  async function callfindCIN(datta, res) {
    var newArrayDataOfOjbect;
    let val = datta.val;
    let reslt;
    reslt = await evolan.findcin(datta);
    return new Promise((resolve, reject) => {
      if (reslt) {
        if (reslt.LIBMSG == "Tiers inexistant") {
          return resolve(reslt);
        } else if (reslt.numTier) {
          var obj = reslt.role;
          newArrayDataOfOjbect = Object.keys(obj).map(function (key) {
            return obj[key];
          });
          logger.info("array:" + newArrayDataOfOjbect[0]);

          if (reslt.dateNaiss !== "00000000") {
            var dnaissance = moment(reslt.dateNaiss, "YYYYMMDD");
            dnaissance = dnaissance.format("YYYY-MM-DD");
          } else {
            var dnaissance = null;
          }

          if (reslt.dateExpCIN !== "00000000") {
            var dateExpCIN = moment(reslt.dateExpCIN, "YYYYMMDD");
            dateExpCIN = dateExpCIN.format("YYYY-MM-DD");
          } else {
            var dateExpCIN = null;
          }
          logger.info("codeg:" + reslt.code_G);
          logger.info("compte:" + reslt.num_compt);
          var rib =
            "" +
            reslt.code_Bq +
            "" +
            reslt.code_G +
            "" +
            reslt.num_compt +
            "" +
            reslt.numRIB;
          var justif = "" + reslt.zoneUR + "" + reslt.zone;
          var data = {
            numTier: reslt.numTier,
            nom: reslt.nom,
            titre: reslt.titre,
            habita: reslt.habitat,
            rue: reslt.rue,
            datecinexp: dateExpCIN,
            cin: reslt.cin,
            quartier: reslt.quartier,
            prenom: reslt.prenom,
            codepostale: reslt.codePostal,
            ville: reslt.ville,
            gsm2: reslt.tel,
            gsm: reslt.gsm,
            canal: reslt.canal,
            codeActivite: reslt.codeActivite,
            rib: rib,
            justif: justif,
            typelocal: reslt.typeLocal,
            dnaissance: dnaissance,
            situationFamilliale: reslt.etat_civil,
            niveauetude: reslt.niv_etude,
            lieudenaissance: reslt.lieu_naissance,
            codeGest: reslt.codeGest,
            origine: reslt.origine,
            secteur: reslt.secteur,
            bidonville:
              reslt.bidonville === ""
                ? 0
                : reslt.bidonville === "N"
                  ? 0
                  : parseInt(reslt.bidonville, 10),
          };

          logger.info(data);
          connection.acquire(function (err, con) {
            closingconnection(con, err, res, () => {
              con.query(
                "insert into  prospect set ? ON DUPLICATE KEY UPDATE nom=?,titre=?,habita=?,rue=?,datecinexp=?,typelocal=?,quartier=?,prenom=?,codepostale=?,ville=?,gsm2=?,gsm=?,canal=?,codeActivite=?,justif=?,dnaissance=?,situationFamilliale=?,niveauetude=?,lieudenaissance=? ,origine=?,rib=?,secteur=?,bidonville=?",
                [
                  data,
                  data.nom,
                  data.titre,
                  data.habita,
                  data.rue,
                  data.datecinexp,
                  data.typelocal,
                  data.quartier,
                  data.prenom,
                  data.codepostale,
                  data.ville,
                  data.gsm2,
                  data.gsm,
                  data.canal,
                  data.codeActivite,
                  data.justif,
                  data.dnaissance,
                  data.situationFamilliale,
                  data.niveauetude,
                  data.lieudenaissance,
                  data.origine,
                  data.rib,
                  data.secteur,
                  data.bidonville,
                ],
                function (err, result) {
                  logger.info("im the result", result, err);
                  if (result) {
                    con.query(
                      "select * from prospect where cin =? ",
                      [data.cin],
                      function (err, result2) {
                        if (result2) {
                          if (result2.length > 0) {
                            var datt = {
                              id: result2[0].id,
                              numTier: data.numTier,
                            };
                            var obj = {};
                            var list = [];
                            for (
                              var i = 0;
                              i < newArrayDataOfOjbect.length;
                              i++
                            ) {
                              obj = {};
                              obj.role = newArrayDataOfOjbect[i];
                              obj.numTier = data.numTier;
                              obj = Object.values(obj);
                              list.push(obj);
                            }
                            logger.info("im the result to send to front", data);
                            callloopinsertroles(list);
                            data.id = result2[0].id;
                            data.photoProfil = result2[0].photoProfil;
                            data.cinR = result2[0].cinR;
                            data.cinV = result2[0].cinV;
                            data.listaddresse = reslt.addresse;
                            data.listrole = reslt.role;
                            return resolve(data);
                          }
                        } else {
                        }
                      }
                    );
                  } else {
                    return resolve({
                      message: "erreur est survenu",
                    });
                  }
                }
              );
            });
          });
          // if(reslt.cinGSM!=reslt.cin && reslt.nbrGSM>0){
          // data.NBRGSM=reslt.nbrGSM
          // }
        }
      } else {
        reslt.LIBMSG == "Erreur! Veuillez réessayer plus tard";
        return resolve(reslt);
      }
    });
  }

  function callloopinsertroles(array, res) {
    connection.acquire(function (err, con) {
      closingconnection(con, err, res, () => {
        con.query(
          "insert into  prospectrole (role, numTier) VALUES ? ON DUPLICATE KEY UPDATE idstatut=idstatut",
          [array],
          function (err, result) { }
        );
      });
    });
    logger.info(array);
  }

  app.post("/user/checkgsm", function (req, res) {
    var gsm = req.body.gsm;

    connection.acquire(function (err, con) {
      closingconnection(con, err, res, () => {
        con.query(
          "select count(*) as count  from prospect where gsm =? ",
          [gsm],
          function (err, result) {
            var gsmNBR;
            if (result[0].count > 0) {
              gsmNBR = result[0].count;
            }
          }
        );
      });
    });
  });
  // app.post("/user/checkpin", function (req, res) {
  //   var code = req.body.code;
  //   var idcrm = req.body.idcrm;
  //   var gsm = req.body.gsm;
  //   logger.info(code);
  //   logger.info(gsm);
  //   connection.acquire(function (err, con) {
  //     if (err) return res.status(400).send({
  //       connecx: err
  //     });
  //     con.query(
  //       "  select  * from gsmpin where numgsm =? and pingsm=? ",
  //       [gsm, code],
  //       function (err, result) {
  //         res.send(result);
  //         con.release();
  //       }
  //     );
  //   });
  // });

  app.post("/user/insertGED", function (req, res) {
    var array = req.body.list;

    connection.acquire(function (err, con) {
      closingconnection(con, err, res, () => {
        con.query(
          "insert into  ged (photo, contexte,radicale) VALUES ? ",
          [array],
          function (err, result) {
            if (result) {
              res.send(result);
            }
          }
        );
      });
    });
  });

  app.post("/user/insertGedServer", function (req, res) {
    var data = {
      photo: req.body.photo,
      contexte: req.body.contexte,
      cin: req.body.cin,
      codeGest: req.body.codeGest,
    };
    connection.acquire(function (err, con) {
      closingconnection(con, err, res, () => {
        con.query(
          "select cin from ged where cin=? ",
          data.cin,
          function (err, result) {
            logger.info(result.length);
            if (result.length >= 10) {
              res.send({ message: "max photos est 10", code: 300 });
            } else {
              con.query(
                "insert into  ged set ? ",
                data,
                function (err, result) {
                  if (result) {
                    logger.info("result inserting", result);
                    res.send(result);
                  }
                }
              );
            }
          }
        );
      });
    });
  });

  app.post("/user/findprospectbyvalueold", function (req, res) {
    var val = req.body.val;
    connection.acquire(function (err, con) {
      closingconnection(con, err, res, () => {
        con.query(
          "select  * from prospect where recherche LIKE ?",
          ["%" + val + "%"],
          function (err, result) {
            res.send(result);
          }
        );
      });
    });
  });

  app.post("/user/checkcininterdit", function (req, res) {
    var cin = req.body.cin;
    logger.info(cin);
    res.send([]);
    // connection.acquire(function (err, con) {
    //   if (err)
    //     return res.status(400).send({
    //       connecx: err,
    //     });
    //   con.query(
    //     "  select * from prospectinterdit where cin =? and motif is not null  ",
    //     [cin],
    //     function (err, result) {
    //       res.send(result);
    //       con.release();
    //     }
    //   );
    // });
  });

  app.post("/user/getprospectsolidaire", function (req, res) {
    var cin = req.body.cin;
    logger.info(cin);
    connection.acquire(function (err, con) {
      closingconnection(con, err, res, () => {
        con.query(
          "select  * from prospect where cin =? ",
          [cin],
          function (err, result) {
            logger.info("le resulta " + result);
            res.send(result);
          }
        );
      });
    });
  });

  app.post("/user/findprospectbyvalue", async function (req, res) {
    var val1 = req.body.val1;
    var val2 = req.body.val2;
    var type = req.body.type;
    var codeGest = req.body.codeGest;
    logger.info(type);
    logger.info(val1);
    logger.info(val2);
    logger.info("This is the CodGest", codeGest);
    let result2;
    let result;
    if (type == "CIN") {
      let dt = {
        val: val1,
        codeGest: codeGest,
      };
      result = await callfindCIN(dt, res);
      var data = ["TIER", result];
      res.send(data);
    } else if (type == "NOM") {
      let dt = {
        val1: val1,
        val2: val2,
        codeGest: codeGest,
      };
      result = await evolan.findbynom(dt, res);
      var data = ["LIST", result];
      res.send(data);
    } else if (type == "numTier") {
      let dt = {
        val: val1,
        codeGest: codeGest,
      };
      result = await callfindTiers(dt, res);
      var data = ["TIER", result];
      res.send(data);
    }
  });
  app.post("/user/getrolesserver", async function (req, res) {
    var id = req.body.id;
    let result2 = await callgetrolebyid(id, res);
    res.send(result2);
  });

  app.post("/user/getlistbaremes", async function (req, res) {
    logger.info("ja hna");


    // --- vérification renouvellement --
    var data = {
      numTier: req.body.numTier,
      codeGest: '004',
      cin: '',
    };
    let reslt = await evolan.contratsByNumTiers(data);

    let nbrPretActif = parseInt(reslt.EMP.actif[reslt.EMP.actif.length - 1].NbrPretActif)
    let nbrPretFin = parseInt(reslt.EMP.fin[reslt.EMP.fin.length - 1].NbrPretFin)
    let nbrPretTotal = nbrPretActif + nbrPretFin
    let etat_client = nbrPretTotal > 0 ? 'RV' : 'PR'
    logger.info('************* INFO RENOUVELLEMENT *****************');
    logger.info(':', nbrPretActif, ':', nbrPretFin, ':', nbrPretTotal, ':', etat_client);
    logger.info('***************************************************');
    // ---------------------------------


    var data = {
      montant: req.body.montant + (req.body.encours ? req.body.encours : 0),
      situation: req.body.situation,
      duree: req.body.duree,
      produit: req.body.produit,
      periodicite: req.body.periodicite,
      // nouveau: req.body.nouveau,
      nouveau: etat_client,  //  vérification renouvellement
      age: req.body.age,
      nature: req.body.nature,
      avecSupp:
        req.body.nature === "CON"
          ? req.body.montant > req.body.encours
            ? 1
            : 0
          : 0,
      impayes: req.body.impayes,
    };
    if (data.situation == "C") {
    } else {
      data.situation = "A";
    }
    logger.info(
      "data to get barames",
      data,
      req.body.montant,
      req.body.encours
    );
    connection.acquire(function (err, con) {
      closingconnection(con, err, res, () => {
        // START --------- mis-a-jour-- table barem  MAJ_Tables  CDGSTR

        //  END --------- mis-a-jour-- table barem  MAJ_Tables  CDGSTR
        con.query(
          "  select  DISTINCTROW bareme,description,tauxmin,libelleProduit,naturebien,produit,natureproduit,bareme,contratcadre from baremes where produit =? and periodiciteunite=? and montantmin<=? and montantmax>=? and dureemin<=? and dureemax>=? and situationfamilliale=?  and naturebien=?  and nouveau=? and impayes=? ",
          [
            data.produit,
            data.periodicite,
            data.montant,
            data.montant,
            data.duree,
            data.duree,
            data.situation,
            data.nature,
            data.nouveau,
            data.impayes,
          ],
          function (err, result) {
            logger.info(err, result);
            res.send(result);
          }
        );
      });
    });
  });

  app.post("/user/getsimulation", function (req, res) {
    var data = {
      IdSimulation: req.body.IdSimulation,
      NbrEcheance: req.body.NbrEcheance,
      codeBien: req.body.codeBien,
      codeProduit: req.body.codeProduit,
      codeBareme: req.body.codeBareme,
      JourEch: req.body.JourEch,
      montant: req.body.montant + (req.body.encours ? req.body.encours : 0),
      DateMAD:
        req.body.IdSimulation === "OTOTPM"
          ? req.body.DateMAD
          : controlDateDebloquage(req.body.DateMAD),
      differe: req.body.differe,
      codeGest: req.body.codeGest,
    };
    var dataa = {
      NOSIMU: data.IdSimulation,
      CDDEVI: "MAD",
      NBECHE: data.NbrEcheance,
      CDNABI: data.codeBien,
      CDPROD: data.codeProduit,
      NOBARU: data.codeBareme,
      CDJECH: data.JourEch,
      MTACC: data.montant.toString().replace(".", ","),
      DTREAL: data.DateMAD,
      NBPERE: data.differe,
      CDGSTR: data.codeGest,
      CDMPEC: "ES",
    };
    connection.acquire(function (err, con) {
      closingconnection(con, err, res, () => {
        con.query(
          'update numeros client set filtre=1 where code="simulation"',
          function (err, result) {
            con.query(
              'select numero from numeros where code="simulation"',
              function (err, result) {
                logger.info(result[0].numero);
                let idsimulation = "digit" + result[0].numero;
                logger.info("montant", data.montant.toString(), data.montant);
                logger.info(
                  data.montant.toString().replace(".", ","),
                  data.montant
                );
                let soapRib = require("soap");
                return new Promise((resolve, reject) => {
                  soapRib.createClient(
                    dataa.CDNABI === "OTOM" || dataa.CDNABI === "OTOP"
                      ? process.env.JAVA_WS_URL_OTO
                      : process.env.JAVA_WS_URL,

                    (err, clienJava) => {
                      logger.info("*****Error Creating Java Client ****", err);
                      dataa.NOSIMU = idsimulation;
                      logger.info("sim obj", dataa);
                      clienJava.contratSimulation(
                        dataa,
                        function (err, result) {
                          if (err)
                            logger.info(
                              " ***** Error Calling ContratSimulation ****",
                              err
                            );
                          let doc = JSON.parse(result?.return)[0].document;
                          logger.info(
                            "**** Result of Simulation **** : ",
                            result.return
                          );
                          // let resp = {
                          //   Amort:
                          //     doc?.contractSimulation?.repaymentSchedule
                          //       ?.installment,
                          //   Prest1:
                          //     doc?.contractSimulation?.services
                          //       ?.repaymentSchedule[0]?.installmentsList
                          //       ?.installment,
                          //   Prest2:
                          //     doc?.contractSimulation?.services
                          //       ?.repaymentSchedule[1]?.installmentsList
                          //       ?.installment,
                          //   LIBMSG: JSON.parse(result?.return)[1].LIBMSG,
                          // };
                          let resp = {
                            Amort:
                              doc?.contractSimulation?.repaymentSchedule
                                ?.installment,
                            Prest1:
                              dataa.CDNABI === "OTOM" ||
                                dataa.CDNABI === "TANM" ||
                                dataa.CDNABI === "MICM"
                                ? doc?.contractSimulation?.services
                                  ?.repaymentSchedule?.installmentsList
                                  ?.installment
                                : doc?.contractSimulation?.services
                                  ?.repaymentSchedule[0]?.installmentsList
                                  ?.installment,
                            Prest2:
                              dataa.CDNABI === "OTOM" ||
                                dataa.CDNABI === "TANM" ||
                                dataa.CDNABI === "MICM"
                                ? doc?.contractSimulation?.services
                                  ?.repaymentSchedule?.installmentsList
                                  ?.installment
                                : doc?.contractSimulation?.services
                                  ?.repaymentSchedule[1]?.installmentsList
                                  ?.installment,
                            LIBMSG: JSON.parse(result?.return)[1].LIBMSG,
                          };
                          logger.info(
                            "Result : ",
                            JSON.parse(result?.return)[1],
                            resp
                          );
                          res.send(resp);
                        }
                      );
                    }
                  );
                });
              }
            );
          }
        );
      });
    });
  });

  app.post("/user/getsimulationConso", function (req, res) {
    var data = {
      IdSimulation: req.body.IdSimulation,
      NbrEcheance: req.body.NbrEcheance,
      codeBien: req.body.codeBien,
      codeProduit: req.body.codeProduit,
      codeBareme: req.body.codeBareme,
      JourEch: req.body.JourEch,
      montant: req.body.montant,
      DateMAD: controlDateDebloquage(req.body.DateMAD),
      differe: req.body.differe,
      codeGest: req.body.codeGest,
      periodicite: req.body.perodicite,
      contratCadre: req.body.contratCadre,
      numContrat1: req.body.numContrat1,
      numContrat2: req.body.numContrat2 ? req.body.numContrat2 : "",
      numTier: req.body.numTier,
      typeClient: req.body.typeClient,
    };
    let logActivites = ["BL", "FL", "SL", "RL"];
    let args = {
      NBPERE: data.differe,
      DATDEB: "",
      CDTYPE: data.periodicite,
      CDTERM: "",
      NBECHE: data.NbrEcheance,
      CDDEVI: "MAD",
      CDJECH: data.JourEch,
      NOBARU: data.codeBareme,
      DTOFFR: "",
      DTREAL: data.DateMAD,
      DTLIVR: data.DateMAD,
      NOBURE: "",
      MDEM: data.montant,
      MACC: data.montant,
      cdMoyenPmnt: "ES",
      contratCadre: data.contratCadre,
      NOSIMU: data.IdSimulation,
      CDNABI: data.codeBien,
      CDPROD: data.codeProduit,
      CDUTI1: logActivites.includes(data.typeClient) ? data.typeClient : "ME",

      CDUTI2: "",
      Role: "EMP",
      NOTIER: data.numTier,
      NumSeqRib: "",
      NumSeqAdd: "",
      CDGSTR: data.codeGest,
      CDGCRE: data.codeGest,
      CDAPPE: "S",
      Garants: [
        {
          dateDebutGarant: "",

          dateFinGarant: "",

          lienGarant: data.lienGarantie ? data.lienGarantie : "",

          montantGarant: data.montantGarantie ? data.montantGarantie : "",

          numSequenceGarant: "",

          numTiersGarant: data.numTierGarant ? data.numTierGarant : "",

          typeGarant: data.typeGarantie ? data.typeGarantie : "",
        },
        {
          dateDebutGarant: "",

          dateFinGarant: "",

          lienGarant: data.lienGarantie2 ? data.lienGarantie2 : "",

          montantGarant: data.montantGarantie2 ? data.montantGarantie2 : "",

          numSequenceGarant: "",

          numTiersGarant: data.numTierGarant2 ? data.numTierGarant2 : "",

          typeGarant: data.typeGarantie2 ? data.typeGarantie2 : "",
        },
      ],
      Pieces: [],
      Prestations: [],
      Contrats: {
        item: [
          new Contrat(
            data.numContrat1,
            data.numContrat1 === "" ? "" : "01",
            data.numContrat1 === "" ? "" : "000001"
          ),

          // item: { numero: data.numContrat1 },
          new Contrat(
            data.numContrat2,
            data.numContrat2 === "" ? "" : "01",
            data.numContrat2 === "" ? "" : "000001"
          ),
        ],
      },
    };
    logger.info(args);

    // var dataa = {
    //   NOSIMU: data.IdSimulation,
    //   CDDEVI: "MAD",
    //   NBECHE: data.NbrEcheance,
    //   CDNABI: data.codeBien,
    //   CDPROD: data.codeProduit,
    //   NOBARU: data.codeBareme,
    //   CDJECH: data.JourEch,
    //   MTACC: data.montant.toString().replace(".", ","),
    //   DTREAL: data.DateMAD,
    //   NBPERE: data.differe,
    //   CDGSTR: data.codeGest,
    //   CDMPEC: "ES",
    // };
    logger.info("sumul obj", args);
    connection.acquire(function (err, con) {
      closingconnection(con, err, res, () => {
        con.query(
          'update numeros client set filtre=1 where code="simulation"',
          function (err, result) {
            con.query(
              'select numero from numeros where code="simulation"',
              function (err, result) {
                logger.info(result[0].numero);
                let idsimulation = "digit" + result[0].numero;
                logger.info("dataaat", args);
                let soapRib = require("soap");
                return new Promise((resolve, reject) => {
                  soapRib.createClient(
                    process.env.JAVA_WS_URL,

                    (err, clienJava) => {
                      clienJava.consolidationContrat(
                        args,
                        function (err, result) {
                          logger.info(result);
                          if (err) logger.info("function", err);
                          let doc = JSON.parse(
                            JSON.parse(result.return)["SIMUXML"]
                          )[0]["document"];

                          let resp = {
                            Amort:
                              doc?.contractSimulation?.repaymentSchedule
                                ?.installment,
                            Prest1:
                              doc?.contractSimulation?.services
                                ?.repaymentSchedule[0]?.installmentsList
                                ?.installment,
                            Prest2:
                              doc?.contractSimulation?.services
                                ?.repaymentSchedule[1]?.installmentsList
                                ?.installment,
                            LIBMSG: JSON.parse(
                              JSON.parse(result.return)["SIMUXML"]
                            )[1]
                              ? JSON.parse(
                                JSON.parse(result.return)["SIMUXML"]
                              )[1].LIBMSG
                              : JSON.parse(result.return)["LIBMSG"],
                          };
                          logger.info(resp);
                          logger.info(process.env.JAVA_WS_URL);
                          res.send(resp);
                        }
                      );
                    }
                  );
                });
                // request.post(
                //   {
                //     headers: { "content-type": "application/json" },
                //     url: "http://localhost:3033/ProspectWsConsumer/simulation",
                //     body: JSON.stringify({
                //       codeGest: data.codeGest,
                //       IdSimulation: idsimulation,
                //       NbrEcheance: data.NbrEcheance,
                //       codeNatBien: data.codeBien,
                //       codeProduit: data.codeProduit,
                //       codeBareme: data.codeBareme,
                //       JourEch: data.JourEch,
                //       Montant: data.montant.toString().replace(".", ","),
                //       DateMAD: data.DateMAD,
                //       Differe: data.differe,
                //     }),
                //   },
                //   (error, response, body) => {
                //     logger.info(error, response, body);
                //     if (error) {
                //       console.dir(error);
                //     } else {
                //       if (body) {
                //         var valeur = JSON.parse(body);
                //         logger.info(valeur);
                //         res.send(valeur);
                //       }
                //     }
                //   }
                // );
              }
            );
          }
        );
      });
    });
  });
  app.post("/user/getsimulationPalier", function (req, res) {
    var data = {
      IdSimulation: req.body.IdSimulation,
      NbrEcheance: req.body.NbrEcheance,
      montant: req.body.montant,
      DateMAD: controlDateDebloquage(req.body.DateMAD),
      codeGest: req.body.codeGest,
      tauxEch1: req.body.tauxEch1,
      mtEch1: req.body.mtEch1,
      tauxEch2: req.body.tauxEch2,
      mtEch2: req.body.mtEch2,
      tauxEch3: req.body.tauxEch3,
    };

    let args = {
      CDGSTR: data.codeGest,
      montant: data.montant * 100,
      cdterm: "F",
      dateDebut: data.DateMAD,
      periodicite: 1,
      nbEch1: data.NbrEcheance / 3,
      tauxEch1: data.tauxEch1,
      mtEch1: data.mtEch1 * 100,
      nbEch2: data.NbrEcheance / 3,
      tauxEch2: data.tauxEch2,
      mtEch2: data.mtEch2 * 100,
      nbEch3: data.NbrEcheance / 3,
      tauxEch3: data.tauxEch3,
    };
    logger.info(args);

    logger.info("sumul obj", args);
    connection.acquire(function (err, con) {
      closingconnection(con, err, res, () => {
        con.query(
          'update numeros client set filtre=1 where code="simulation"',
          function (err, result) {
            con.query(
              'select numero from numeros where code="simulation"',
              function (err, result) {
                logger.info(result[0].numero);
                let idsimulation = "digit" + result[0].numero;
                logger.info("dataaat", args);
                let soapRib = require("soap");
                return new Promise((resolve, reject) => {
                  soapRib.createClient(
                    process.env.JAVA_WS_URL,

                    (err, clienJava) => {
                      clienJava.contratSimulationPalier(
                        args,
                        function (err, result) {
                          logger.info(
                            JSON.parse(result.return),
                            JSON.parse(result.return).length
                          );
                          // if (err) logger.info("function", err);
                          // let doc = JSON.parse(
                          //   JSON.parse(result.return)["SIMUXML"]
                          // )[0]["document"];

                          // let resp = {
                          //   Amort:
                          //     doc?.contractSimulation?.repaymentSchedule
                          //       ?.installment,
                          //   Prest1:
                          //     doc?.contractSimulation?.services
                          //       ?.repaymentSchedule[0]?.installmentsList
                          //       ?.installment,
                          //   Prest2:
                          //     doc?.contractSimulation?.services
                          //       ?.repaymentSchedule[1]?.installmentsList
                          //       ?.installment,
                          //   LIBMSG: JSON.parse(
                          //     JSON.parse(result.return)["SIMUXML"]
                          //   )[1]
                          //     ? JSON.parse(
                          //         JSON.parse(result.return)["SIMUXML"]
                          //       )[1].LIBMSG
                          //     : JSON.parse(result.return)["LIBMSG"],
                          // };
                          // logger.info(resp);
                          res.send(JSON.parse(result.return));
                        }
                      );
                    }
                  );
                });
              }
            );
          }
        );
      });
    });
  });
  //checknetwork
  app.get("/user/checknetwork", function (req, res) {
    res.send("hello TESTDD");
    //setTimeout(function(){  res.send('hello world'); }, 1000);
  });
  /* Insert user. */
  app.post("/user/insert", function (req, res) {
    var newClient = {
      nom: req.body.nom,
      prenom: req.body.prenom,
      telephone: req.body.telephone,
      cin: req.body.cin,
      photo: req.body.photo,
      localisation: req.body.localisation,
      signature: req.body.signature,
    };
    connection.acquire(function (err, con) {
      closingconnection(con, err, res, () => {
        con.query(
          "insert into client set ?",
          newClient,
          function (err, result) {
            res.send(result);
          }
        );
      });
    });
  });

  function callgetrolebyid(id, res) {
    logger.info("le id " + id);
    return new Promise((resolve, reject) => {
      connection.acquire(function (err, con) {
        closingconnection(con, err, res, () => {
          con.query(
            "select * from prospectrole where numTier=?",
            [id],
            function (err, result) {
              return resolve(result);
            }
          );
        });
      });
    });
  }

  /* Update user. */
  app.post("/user/update", function (req, res) {
    var user = req.body.user;
    connection.acquire(function (err, con) {
      closingconnection(con, err, res, () => {
        con.query(
          "update user set nom = ?,prenom = ? where id = ?",
          [user.nom, user.prenom, user.id],
          function (err, result) {
            res.send(result);
          }
        );
      });
    });
  });

  app.post("/user/planifierContact", async function (req, res) {
    var data = {
      typeContact: req.body.typescontact,
      numTier: req.body.numTier,
      LibSupport: req.body.libsupport,
      codesupport: req.body.codeSupport,
      action: req.body.action,
      commentaire: req.body.commentaire,
      coderesultat: req.body.coderesultat,
      heurecontact: req.body.heurecontact,
      role: req.body.role,
      codeGest: req.body.codeGest,
      dateContact: req.body.datecontact,
      LibMotif: req.body.libmotif,
      CodeMotif: req.body.codeMotif,
    };

    let datecont;

    if (data.dateContact) {
      datecont = moment(data.dateContact, "YYYY-MM-DD");
      data.datecont = datecont.format("YYYYMMDD");
    }

    data.heurecontact = data.heurecontact + "0000";

    let reslt = await evolan.planificationContact(data);
    res.send(reslt);

    // connection.acquire(function(err, con) {
    // if(err)
    // return res.status(400).send({message: err});
    // con.query('insert into contacts set  ?',data, function(err, result) {
    // con.release();
    // res.send(result);
    // })
    // })
  });

  /* Delte user. */
  app.post("/user/delete", function (req, res) {
    var id = req.body.id;
    connection.acquire(function (err, con) {
      closingconnection(con, err, res, () => {
        con.query(
          "update user set statut = ? where id = ?",
          [0, id],
          function (err, result) {
            res.send(result);
          }
        );
      });
    });
  });

  app.post("/user/getprochesdemoi", function (req, res) {
    var lat = req.body.lat;
    var lag = req.body.lag;
    logger.info(lat);
    logger.info(lag);
    connection.acquire(function (err, con) {
      closingconnection(con, err, res, () => {
        con.query(
          "SELECT DISTINCTROW p.*,a.cin AS cin FROM positiongps a,prospect p where a.cin=p.cin and (111.111 * DEGREES(ACOS(LEAST(1.0, COS(RADIANS(a.latitde))* COS(RADIANS(?))* COS(RADIANS(a.Longitude - ?))+ SIN(RADIANS(a.latitde))* SIN(RADIANS(?)))))) <1 ",
          [lat, lag, lat],
          function (err, result) {
            logger.info(result);
            res.send(result);
          }
        );
      });
    });
  });

  app.post("/user/getprospectbypostale", function (req, res) {
    var code = req.body.code;
    connection.acquire(function (err, con) {
      closingconnection(con, err, res, () => {
        con.query(
          "SELECT * from prospect where codepostale=? ",
          [code],
          function (err, result) {
            res.send(result);
          }
        );
      });
    });
  });

  app.post("/user/insertanalyserep", function (req, res) {
    var compl = {
      id: req.body.id,
      complement: req.body.reponce,
    };
    connection.acquire(function (err, con) {
      closingconnection(con, err, res, () => {
        con.query(
          " update complements set complement=? where id =?",
          [compl.complement, compl.id],
          function (err, result) {
            res.send(result);
          }
        );
      });
    });
  });

  app.post("/user/getanalysefin", function (req, res) {
    var idbloc = req.body.idbloc;
    var idcrm = req.body.idcrm;
    connection.acquire(function (err, con) {
      closingconnection(con, err, res, () => {
        con.query(
          "select * from complements where idcrm=? and idbloc=?",
          [idcrm, idbloc],
          function (err, result) {
            res.send(result);
          }
        );
      });
    });
  });

  app.post("/user/getbloc", function (req, res) {
    var id = req.body.id;

    connection.acquire(function (err, con) {
      closingconnection(con, err, res, () => {
        con.query(
          "select * from complementbloque where prefixe=?",
          [id],
          function (err, result) {
            res.send(result);
          }
        );
      });
    });
  });

  app.post("/user/insertgarant", function (req, res) {
    var dt = {
      typegarantie: req.body.typegarantie,
      montantgarantie: 0,
      numtier: req.body.numTier,
      numtiergarant: req.body.numTiergarant,
      numcontrat: req.body.numcontrat,
    };

    connection.acquire(function (err, con) {
      closingconnection(con, err, res, () => {
        con.query(
          "insert into prospectbesoingranties set ?",
          dt,
          function (err, result) {
            res.send(result);
          }
        );
      });
    });
  });

  app.post("/user/getgarantbybesoin", function (req, res) {
    var args = { NOCONT: req.body.id, CDGSTR: req.body.codeGest };
    let soapRib = require("soap");
    return new Promise((resolve, reject) => {
      soapRib.createClient(
        process.env.JAVA_WS_URL,

        (err, clienJava) => {
          logger.info("*****Error Creating Java Client ****", err);
          logger.info("garantie req", args);
          clienJava.GarantiesContrat(args, function (err, result) {
            logger.info("GarantiesContrat", result.return);
            //typegarantie
            //lien
            //numTiergarant
            //numTier
            res.send(
              JSON.parse(result?.return).map((e) => ({
                lien: e.NOENRE,
                typegarantie: e.CDTYGA,
                numTiergarant: e.NOTIER,
              }))
            );
          });
        }
      );
    });

    // connection.acquire(function (err, con) {
    //   closingconnection(con, err, res, () => {
    //     con.query(
    //       "select * from prospectbesoingranties where codecontrat=? or numcontrat=? ",
    //       [id, id],
    //       function (err, result) {
    //         res.send(result);
    //       }
    //     );
    //   });
    // });
  });

  app.post("/user/getgarantfondcommerce", function (req, res) {
    var id = req.body.id;
    connection.acquire(function (err, con) {
      closingconnection(con, err, res, () => {
        con.query(
          "select * from prospectbesoingranties where idbesoin=? ",
          [id],
          function (err, result) {
            res.send(result);
          }
        );
      });
    });
  });

  app.post("/user/updategarantie", function (req, res) {
    var id = req.body.id;
    var lien = req.body.lien;
    connection.acquire(function (err, con) {
      closingconnection(con, err, res, () => {
        con.query(
          "update  prospectbesoingranties set lien=? where id=? ",
          [lien, id],
          function (err, result) {
            res.send(result);
          }
        );
      });
    });
  });

  app.post("/user/getcomplementslist", function (req, res) {
    var id = req.body.id;
    logger.info(id);
    connection.acquire(function (err, con) {
      closingconnection(con, err, res, () => {
        con.query(
          "select * from complementlistdetail where code=? ",
          [id],
          function (err, result) {
            res.send(result);
          }
        );
      });
    });
  });

  // ---------------- Get bareme for similator_App
  app.post("/user/getBaremeOTO", (req, res) => {
    let montant = req.body.montant;
    let situationFamiliale = req.body.situationFamiliale;
    logger.info(montant);
    connection.acquire(function (err, con) {
      closingconnection(con, err, res, () => {
        con.query(
          `SELECT bareme FROM baremes  where naturebien like "OTO%" and situationfamilliale='${situationFamiliale}' and (${montant} between montantmin and montantmax);`,
          function (err, result) {
            logger.info(err);
            res.status(200).send(result[0]);
          }
        );
      });
    });
  });

  app.post("/user/getBaremeTMoumtaz", (req, res) => {
    let montant = req.body.montant;
    let situationFamiliale = req.body.situationFamiliale;
    let duree = req.body.nbrEcheance;
    let nouveau = req.body.natureClient;

    connection.acquire(function (err, con) {
      closingconnection(con, err, res, () => {
        con.query(
          `SELECT bareme FROM baremes where naturebien='PRE' and situationfamilliale='${situationFamiliale}' and (${montant} between montantmin and montantmax) and (${duree} between dureemin and dureemax) and nouveau='${nouveau}';`,
          function (err, result) {
            if (err) return res.status(400).send({ message: err });
            else {
              return res.status(200).send(result[0]);
            }
          }
        );
      });
    });
  });

  app.post("/user/getBaremePIE_PIL", (req, res) => {
    let montant = req.body.montant;
    let naturebien =
      req.body.product === "simulation_pil"
        ? req.body.situationFamiliale === "C"
          ? "L_ZR"
          : "L_ZU"
        : req.body.situationFamiliale === "C"
          ? "E_ZR"
          : "E_ZU";
    let duree = req.body.nbrEcheance;
    let periodicity = req.body.periodicitie;
    let nouveau = req.body.natureClient === "nouveau" ? "PR" : "RV";

    logger.info(
      "*************",
      montant,
      naturebien,
      duree,
      periodicity,
      nouveau
    );
    connection.acquire(function (err, con) {
      closingconnection(con, err, res, () => {
        con.query(
          `SELECT bareme FROM baremes where naturebien='${naturebien}'and nouveau='${nouveau}' and periodicite='${periodicity}' and ( ${montant} >= montantmin and ${montant} <= montantmax) and (${duree} >= dureemin and ${duree} <= dureemax);`,
          function (err, result) {
            if (err) return res.status(400).send({ message: err });
            else {
              return res.status(200).send(result[0]);
            }
          }
        );
      });
    });
  });

  app.post("/user/getBaremeTSek", (req, res) => {
    let naturebien = req.body.subProduct === "sek" ? "RURA" : "RURP";
    let montant = req.body.montant;
    let situationFamiliale = req.body.situationFamiliale;
    let duree = req.body.nbrEcheance;
    let nouveau = req.body.natureClient;

    connection.acquire(function (err, con) {
      closingconnection(con, err, res, () => {
        con.query(
          `SELECT bareme FROM baremes where naturebien="${naturebien}" and situationfamilliale='${situationFamiliale}' and (${montant} between montantmin and montantmax) and (${duree} between dureemin and dureemax) and nouveau="${nouveau}";`,
          function (err, result) {
            if (err) return res.status(400).send({ message: err });
            else {
              return res.status(200).send(result[0]);
            }
          }
        );
      });
    });
  });

  app.post("/user/getBaremeTSekPlus", (req, res) => {
    let naturebien = "RURP";
    let montant = req.body.montant;
    let situationFamiliale = req.body.situationFamiliale;
    let duree = req.body.nbrEcheance;
    let nouveau = req.body.natureClient;

    connection.acquire(function (err, con) {
      closingconnection(con, err, res, () => {
        con.query(
          `SELECT bareme, tauxmax FROM baremes where naturebien="${naturebien}" and situationfamilliale='${situationFamiliale}' and (${montant} between montantmin and montantmax) and (${duree} between dureemin and dureemax) and nouveau="${nouveau}";`,
          function (err, result) {
            if (err) return res.status(400).send({ message: err });
            else {
              return res.status(200).send(result[0]);
            }
          }
        );
      });
    });
  });

  app.post("/user/getBaremeTanmiya", (req, res) => {
    let montant = req.body.montant;
    let situationFamiliale = req.body.situationFamiliale;
    connection.acquire(function (err, con) {
      closingconnection(con, err, res, () => {
        con.query(
          `SELECT bareme FROM baremes where naturebien like "TAN%" and situationfamilliale='${situationFamiliale}' and ${montant} between montantmin and montantmax;`,
          function (err, result) {
            logger.info(err);
            res.status(200).send(result[0]);
          }
        );
      });
    });
  });

  app.post("/user/getBaremeMilkia", (req, res) => {
    let montant = req.body.montant;
    let situationFamiliale = req.body.situationFamiliale;
    let codeBient = req.body.codeBien;

    logger.info(montant);
    connection.acquire(function (err, con) {
      closingconnection(con, err, res, () => {
        con.query(
          `SELECT bareme FROM baremes where naturebien ='${codeBient}' and situationfamilliale='${situationFamiliale}' and ${montant} between montantmin and montantmax;`,
          function (err, result) {
            logger.info(err);
            res.status(200).send(result[0]);
          }
        );
      });
    });
  });

  app.post("/user/getBaremePS", (req, res) => {
    logger.info("-------------------------", req.body);
    let montant = req.body.montant;
    let naturebien = req.body.situationFamiliale === "C" ? "ZR" : "ZU";
    let duree = req.body.nbrEcheance;
    let periodicity = req.body.periodicitie;
    let nouveau = req.body.natureClient;

    connection.acquire(function (err, con) {
      closingconnection(con, err, res, () => {
        con.query(
          `SELECT bareme FROM baremes where produit="PSD" and naturebien='${naturebien}'and nouveau='${nouveau}' and periodicite='${periodicity}' and ( ${montant} > montantmin and ${montant} <= montantmax) and (${duree} >= dureemin and ${duree} <= dureemax);`,
          function (err, result) {
            if (err) return res.status(400).send({ message: err });
            else {
              return res.status(200).send(result[0]);
            }
          }
        );
      });
    });
  });
  app.post("/user/RealiserRec", async function (req, res) {
    var data = {
      idprospect: req.body.idprospect,
      idstatut: req.body.idstatut,
      action: req.body.action,
      numTier: req.body.numTier,
      type: req.body.type,
      commentaire: req.body.commentaire,
      modecontact: req.body.mode,
      dossier: req.body.dossier,
      codesupport: req.body.codesupport,
      coderesultat: req.body.coderesultat,
      heurecontact: req.body.heurecontact,
      typeContact: req.body.typeContact,
      role: "EMP",
      codeGest: req.body.codeGest,
      dateContact: req.body.datecontact,
      LibMotif: req.body.motif,
      CodeMotif: req.body.codemotif,
      numContact: req.body.numContact,
      datenextcontact: req.body.datenextcontact,
    };
    let datecont;
    let datenextcont;
    if (data.dateContact) {
      datecont = moment(data.dateContact, "YYYY-MM-DD");
      datecont = datecont.format("YYYYMMDD");
    }
    if (data.datenextcontact) {
      datenextcont = moment(data.datenextcontact, "YYYY-MM-DD");
      datenextcont = datenextcont.format("YYYYMMDD");
    }
    data.heurecontact = data.heurecontact + "0000";
    var id = req.body.idcontact;
    data.datecont = datecont;
    if (data.numContact) {
      logger.info("realContact", data);
      let reslt = await evolan.realisationDuContact(data);
      res.send(reslt);
    } else {
      logger.info("planificationContact", data);
      let reslt = await evolan.planificationContact(data);
      if (data.datenextcontact) {
        data.typeContact = "P";
        data.datecont = datenextcont;
        let reslt = await evolan.planificationContact(data);
      }
      res.send(reslt);
    }
    // connection.acquire(function (err, con) {
    //   if (err)
    //     return res.status(400).send({
    //       message: err,
    //     });
    //   con.query(
    //     "UPDATE contacts set idprospect=?,idstatut=?,action=?,numTier=?,type=?,commentaire=?,modecontact=?,dossier=?,CodeMotif=?,LibMotif=?,dateContact=?,role=?,typeContact=?,coderesultat=?,codesupport=? where id=?",
    //     [
    //       data.idprospect,
    //       data.idstatut,
    //       data.action,
    //       data.numTier,
    //       data.type,
    //       data.commentaire,
    //       data.modecontact,
    //       data.dossier,
    //       data.CodeMotif,
    //       data.motif,
    //       data.dateContact,
    //       data.role,
    //       data.typeContact,
    //       data.coderesultat,
    //       data.codesupport,
    //       id,
    //     ],
    //     async function (err, result) {
    //       if (result) {
    //         logger.info(result);
    //         data.datecont = datecont;
    //         if (data.numContact) {
    //           let reslt = await evolan.realisationDuContact(data);
    //         } else {
    //           let reslt = await evolan.planificationContact(data);
    //         }
    //         con.release();
    //         res.send(result);
    //       }
    //     }
    //   );
    // });
  });

  app.get("/sendReporting", (req, res) => {
    // var planification = require('node-schedule')
    // planification.scheduleJob("0 0 * * * *", () => {

    var excel = require("exceljs");
    const nodemailer = require("nodemailer");

    connection.acquire(function (err, con) {
      closingconnection(con, err, res, () => {
        let dateNow = new Date()
          .toLocaleDateString()
          .replace(/\//g, "-")
          .split("-");
        let date1 =
          dateNow[2] +
          "-" +
          (dateNow[0].length > 1 ? dateNow[0] : "0" + dateNow[0]) +
          "-" +
          (dateNow[1].length > 1 ? dateNow[1] : "0" + dateNow[1]);

        con.query(
          `SELECT * FROM digitalDB_Dev.table_reporting;`,
          function (error, results, fields) {
            if (error) throw error;

            // -- Extraction avec le fichier Excel
            var reporting = JSON.parse(JSON.stringify(results));
            logger.info(reporting);

            var excelFile = new excel.Workbook();
            let excelSheet = excelFile.addWorksheet("Reporting");

            excelSheet.getRow(1).font = {
              name: "Cabin",
              family: 4,
              size: 10,
              bold: true,
            };
            excelSheet.getRow(1).alignment = {
              vertical: "middle",
              horizontal: "center",
            };
            excelSheet.getRow(1).height = 26;

            excelSheet.columns = [
              {
                header: "Nom et Prénom",
                key: "nomPrenom",
                width: 30,
              },
              {
                header: "Code Gestionnaire",
                key: "codeGest",
                width: 20,
              },
              {
                header: "Date",
                key: "dateOperation",
                width: 20,
              },
              {
                header: "Recherche CIN",
                key: "rechercheCIN",
                width: 20,
              },
              {
                header: "Création Prospect",
                key: "creationProspect",
                width: 20,
              },
              {
                header: "Simulation Prospect",
                key: "simulationProspect",
                width: 20,
              },
              {
                header: "Création Emprunteur",
                key: "creationEmprunteur",
                width: 20,
              },
              {
                header: "Simulation Crédit",
                key: "simulationCredit",
                width: 20,
              },
              {
                header: "Création Contrat",
                key: "creationContrat",
                width: 20,
              },
              {
                header: "Analyse Financière",
                key: "analyseFinanciere",
                width: 20,
              },
              {
                header: "Vision 360",
                key: "vision360",
                width: 20,
              },
            ]; // create columns of excel table

            excelSheet.addRows(reporting);
            let excelExtaction = new Date()
              .toLocaleDateString()
              .replace(/\//g, "-");

            excelFile.xlsx.writeFile(`Reporting_${excelExtaction}.xlsx`); // export email
            // let file = excelFile.xlsx.writeFile(`Reporting_${excelExtaction}.xlsx`); // export email

            // var path = require("path");
            // var reportingPath = path.join(
            //   __dirname,
            //   `Reporting_${excelExtaction}.xlsx`
            // );

            // -- Envoyer par email

            // let transporter = nodemailer.createTransport({
            //   host: "192.162.110.12",
            //   port: 587,
            //   secure: false,
            //   auth: {
            //     user: "a.baddou@alamana.org.ma",
            //     pass: "alamana21",
            //   },
            //   ignoreTLS: true,
            // });

            // let mailOption = {
            //   from: "a.baddou@alamana.org.ma",
            //   to: "a.baddou@alamana.org.ma",
            //   subject: "Reporting",
            //   text: `Le rporting d'aujourd'hui : ${excelExtaction}`,
            //   attachments: [
            //     {
            //       path: reportingPath,
            //     },
            //   ],
            // };
            // transporter.sendMail(mailOption, (error, result) => {
            //   if (error) {
            //     logger.info(
            //       "-- erreur d'envoie du email pour le reporting : ",
            //       error
            //     );
            //   } else {
            //     logger.info(
            //       "-- L'envoie du message du reporting est faite avec succès"
            //     );
            //   }
            // });
          }
        );
      });
    });
  });

  app.post("/updateReporting", (req, res) => {
    logger.info("-- Reporting", req.body);
    res.status(200).json({ msg: "OK" });

    let operation = req.body.operation;
    let codeGest = req.body.codeGest;
    let nomPrenom = req.body.nomPrenom;
    let rechercheCIN = req.body.operation === "rechercheCIN";
    let creationContrat = req.body.operation === "creationContrat";
    let creationEmprunteur = req.body.operation === "creationEmprunteur";
    let simulationCredit = req.body.operation === "simulationCredit";

    let creationProspect = req.body.operation === "creationProspect";
    let simulationProspect = req.body.operation === "simulationProspect";
    let vision360 = req.body.operation === "vision360";
    let analyseFinanciere = req.body.operation === "analyseFinanciere";

    logger.info("Reporting ......... : ", req.body);

    let dateNow = new Date()
      .toLocaleDateString()
      .replace(/\//g, "-")
      .split("-");
    let date1 =
      dateNow[2] +
      "-" +
      (dateNow[0].length > 1 ? dateNow[0] : "0" + dateNow[0]) +
      "-" +
      (dateNow[1].length > 1 ? dateNow[1] : "0" + dateNow[1]);
    logger.info("-- dateNow : ", dateNow, " -- date1 : ", date1);

    connection.acquire(function (err, con) {
      closingconnection(con, err, res, () => {
        con.query(
          `select codeGest from digitalDB_Dev.table_reporting where codeGest = "${codeGest}" and dateOperation = "${date1}"; `,
          function (error, results, fields) {
            if (error) {
              logger.info(error);
            } else if (results.length) {
              con.query(
                `update digitalDB_Dev.table_reporting set ${operation}=${operation}+1 where codeGest = "${codeGest}"; `,
                function (error, results, fields) {
                  if (error) logger.info(error);
                  logger.info("The solution is : ", results);
                }
              );
            } else {
              con.query(
                `insert into digitalDB_Dev.table_reporting (nomPrenom, codeGest, dateOperation, rechercheCIN, vision360, creationProspect, simulationProspect, creationEmprunteur, simulationCredit, creationContrat, analyseFinanciere) values ("${nomPrenom}", "${codeGest}", "${date1}", ${rechercheCIN ? 1 : 0
                },${vision360 ? 1 : 0}, ${creationProspect ? 1 : 0}, ${simulationProspect ? 1 : 0
                }, ${creationEmprunteur ? 1 : 0}, ${simulationCredit ? 1 : 0
                }, ${creationContrat ? 1 : 0}, ${analyseFinanciere ? 1 : 0}) `,
                function (error, results, fields) {
                  if (error) logger.info(error);
                  logger.info("The solution is : ", results);
                }
              );
            }
            logger.info("The solution is : ", results);
          }
        );
      });
    });
  });
  app.post("/user/deleteGed", function (req, res) {
    var id = req.body.id;
    logger.info("bef", id);

    if (id != undefined) {
      logger.info("aft", id);
      connection.acquire(function (err, con) {
        closingconnection(con, err, res, () => {
          con.query("delete from  ged where id=? ", id, function (err, result) {
            if (result) {
              res.send({ message: "ok", code: 200 });
            } else {
              res.send({ message: "not ok", code: 400 });
            }
          });
        });
      });
    } else {
      res.send({ code: 400, message: `id not valid ${req.body.id},${id}` });
    }
  });
};
