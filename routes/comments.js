const express = require("express");
const router = express.Router({ mergeParams: true });
const Campground = require("../models/campground");
const Comment = require("../models/comment");
const middleware = require("../middleware");
const { isLoggedIn, checkUserComment, isAdmin } = middleware;

//Comments New
router.get("/new", isLoggedIn, function (req, res) {
  // find campground by id
  console.log(req.params.id);
  Campground.findById(req.params.id, function (err, campground) {
    if (err) {
      console.log(err);
    } else {
      res.render("comments/new", { campground: campground });
    }
  })
});

//Comments Create
router.post("/", isLoggedIn, function (req, res) {
  //lookup campground using ID
  Campground.findById(req.params.id).populate('comments').exec(function (err, campground) {
    if (err) {
      console.log(err);
      res.redirect("/campgrounds");
    } else {
      var comment = req.body.comment;
      var author = {
        id: req.user._id,
        username: req.user.username
      }
      var newComment = {
        text: comment,
        author: author
      }
      Comment.create(newComment, function (err, comment) {
        if (err) {
          console.log(err);
        } else {
          campground.comments = [...campground.comments, comment];
          campground.save().then((savedComment) => {
            console.log("=================", savedComment);
            req.flash('success', 'Created a comment!');
            res.redirect('/campgrounds/' + campground._id);
          }).catch((err) => {
            console.log(err);
          });;
          // console.log("=================",comment);
          // req.flash('success', 'Created a comment!');
          // res.redirect('/campgrounds/' + campground._id);
        }
      });
    }
  });
});

router.get("/:commentId/edit", isLoggedIn, checkUserComment, function (req, res) {
  res.render("comments/edit", { campground_id: req.params.id, comment: req.comment });
});

router.put("/:commentId", isAdmin, function (req, res) {
  var comment = req.body.comment;
  var author = {
    id: req.user._id,
    username: req.user.username
  }
  var newData = {
    text: comment,
    author: author
  }
  Comment.findByIdAndUpdate(req.params.commentId, {$set: newData}, function (err, comment) {
    if (err) {
      console.log(err);
      req.flash("error", err.message);
      res.render("edit");
    } else {
      req.flash("success", "Successfully Updated!");
      res.redirect("/campgrounds/" + req.params.id);
    }
  });
});

router.delete("/:commentId", isLoggedIn, checkUserComment, function (req, res) {
  // find campground, remove comment from comments array, delete comment in db
  Campground.findByIdAndUpdate(req.params.id, {
    $pull: {
      comments: req.comment.id
    }
  }, function (err) {
    if (err) {
      console.log(err)
      req.flash('error', err.message);
      res.redirect('/');
    } else {
      req.comment.remove(function (err) {
        if (err) {
          req.flash('error', err.message);
          return res.redirect('/');
        }
        req.flash('error', 'Comment deleted!');
        res.redirect("/campgrounds/" + req.params.id);
      });
    }
  });
});

module.exports = router;