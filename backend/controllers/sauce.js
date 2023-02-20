const Sauce = require("../models/Sauce");
const fs = require("fs");

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);

  delete sauceObject.id;
  delete sauceObject.userId;
  const sauce = new Sauce({
    ...sauceObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });

  sauce.save()
    .then((sauce) => {
        res.status(200).json(sauce);
      })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({
    _id: req.params.id,
  })
    .then((sauce) => {
      res.status(200).json(sauce);
    })
    .catch((error) => {
      res.status(404).json({
        error: error,
      });
    });
};

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };
  //je supprime le userId venant de la requête pour mesure de sécurité
  delete sauceObject._userId;
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId != req.auth.userId) {
        res.status(401).json({ message: "Not authorized" });
      } else {
        Sauce.updateOne(
          { _id: req.params.id },
          { ...sauceObject, _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: "Sauce modifié!" }))
          .catch((error) => res.status(401).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
  .then((sauce) => {
    if (sauce.userId != req.auth.userId) {
        res.status(401).json({ message: "Not authorized" });
      } else {
        const filename = sauce.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          Sauce.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: "Sauce supprimée !" });
            })
            .catch((error) => res.status(401).json({ error }));
        });
      }
  })

.catch((error) => {
  res.status(500).json({ error });
});
};
exports.getAllSauce = (req, res, next) => {
  Sauce.find()
    .then((sauces) => {
      res.status(200).json(sauces);
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};

exports.likeUnlikeSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
        const userId = req.auth.userId;
        const likeType = req.body.like;
        console.log(sauce)
        
        switch(likeType) {
            case 1:
                if (!sauce.usersLiked.includes(userId)) {
                    sauce.likes++;
                    sauce.usersLiked.push(userId);
                }
                break;
            case 0:
                if (sauce.usersLiked.includes(userId)) {
                    --sauce.likes;
                    sauce.usersLiked.splice(sauce.usersLiked.indexOf(userId), 1);
                } else if (sauce.usersDisliked.includes(userId)) {
                    --sauce.dislikes;
                    sauce.usersDisliked.splice(sauce.usersDisliked.indexOf(userId), 1);
                }
                break;
            case -1:
                if (!sauce.usersDisliked.includes(userId)) {    
                    ++sauce.dislikes;
                    sauce.usersDisliked.push(userId);
                }
                break;
            default: 
            res.status(400).json({
                message: "Requete invalide"
            });
        }
        sauce.save()
        .then(() => res.status(200).json({ message: "Sauce modifié!" }))
        .catch((error) => res.status(401).json({ error }));
    })
    
};