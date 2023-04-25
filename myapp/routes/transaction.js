/*
  transaction.js -- Router for the Transaction
*/
const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction')
const User = require('../models/User')


/*
this is a very simple server which maintains a key/value
store using an object where the keys and values are lists of strings
*/

isLoggedIn = (req,res,next) => {
  if (res.locals.loggedIn) {
    next()
  } else {
    res.redirect('/login')
  }
}

// get the value associated to the key
router.get('/transaction/',
  isLoggedIn,
  async (req, res, next) => {
    const show = req.query.show
    let sortParams = {};
    let items = [];
    switch(show){
      case 'category':
        sortParams = { category: 1, createdAt: 1 };
        items = await Transaction.find({ userId: req.user._id }).sort(sortParams);
        break;

      case 'amount':
        sortParams = { amount: 1, createdAt: 1 };
        items = await Transaction.find({ userId: req.user._id }).sort(sortParams);
        break;

      case 'description':
        sortParams = { description: 1, createdAt: 1 };
        items = await Transaction.find({ userId: req.user._id }).sort(sortParams);
        break;

      case 'date':
        sortParams = { createdAt: 1 };
        items = await Transaction.find({ userId: req.user._id }).sort(sortParams);
        break;

      case 'group-by-category':
        items = await Transaction.aggregate([
            { $match: { userId: req.user._id } },
            {
            $group: {
                _id: '$category',
                totalAmount: { $sum: '$amount' }
            }
            },
            { $sort: { _id: 1 } }
        ]);
        // router.get('/transaction/group-by-category',
        // async (req, res, next) => {
        //     let results =
        //           await Transaction.aggregate(
        //               [ 
        //                 {$group:{
        //                   _id:'$userId',
        //                   total:{$count:{}}
        //                   }},
        //                 {$sort:{total:-1}},              
        //               ])
                    
        //       results = 
        //          await User.populate(results,
        //                  {path:'_id',
        //                  select:['username','age']})
        //          });
        break;

      default:
        sortParams = { createdAt: 1 };
        items = await Transaction.find({ userId: req.user._id }).sort(sortParams);
        break;
    }

    // reverse sort order for descending fields
    if (show === 'amount' || show === 'description') {
      sortParams[show] = -1;
      items = await Transaction.find({ userId: req.user._id }).sort(sortParams);
    }

    res.render('transaction', { items, show, sortParams });
});



/* add the value in the body to the list associated to the key */
router.post('/transaction',
  isLoggedIn,
  async (req, res, next) => {
      const transaction = new Transaction(
        {item:req.body.item,
         createdAt: new Date(),
         amount: parseInt(req.body.amount),
         description: req.body.description,
         category: req.body.category,
         userId: req.user._id
        })
      await transaction.save();
      res.redirect('/transaction')
});

router.get('/transaction/remove/:itemId',
  isLoggedIn,
  async (req, res, next) => {
      console.log("inside /transaction/remove/:itemId")
      await Transaction.deleteOne({_id:req.params.itemId});
      res.redirect('/transaction')
});

router.get('/transaction/edit/:itemId',
  isLoggedIn,
  async (req, res, next) => {
      console.log("inside /transaction/edit/:itemId")
      const item = 
       await Transaction.findById(req.params.itemId);
      //res.render('edit', { item });
      res.locals.item = item
      res.render('edit')
      //res.json(item)
});

// router.post('/transaction/updateTransactionItem',
//   isLoggedIn,
//   async (req, res, next) => {
//       const {itemId,item,priority} = req.body;
//       console.log("inside /transaction/complete/:itemId");
//       await TransactionItem.findOneAndUpdate(
//         {_id:itemId}
//       res.redirect('/transaction')
// });

router.get('/transaction/byUser',
  isLoggedIn,
  async (req, res, next) => {
      let results =
            await Transaction.aggregate(
                [ 
                  {$group:{
                    _id:'$userId',
                    total:{$count:{}}
                    }},
                  {$sort:{total:-1}},              
                ])
              
        results = 
           await User.populate(results,
                   {path:'_id',
                   select:['username','age']})

        //res.json(results)
        res.render('summarizeByUser',{results})
});



module.exports = router;