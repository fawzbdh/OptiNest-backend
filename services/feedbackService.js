const Feedback = require("../models").Feedback;
const asyncHandler = require('express-async-handler')
const ApiError=require('../utils/apiError')



// @desc    Get all feedback
// @route   GET api/zonetravail/
// @access  Private
exports.getFeedback=asyncHandler(async(req,res) => {
    const feedback = await Feedback.findAll();
    res.status(200).json({results:feedback.length,data:feedback})
  });

// @desc    Get specific Feedback by id
// @route   GET api/zonetravail/:id
// @access  Private
exports.getFeedback = asyncHandler(async(req,res,next)=>{
  const {id}=req.params; 
  const feedback = await Feedback.findOne({where:{id:id}});
  if(!feedback)
  {
    return   next(new ApiError(`Feedback not found for this id ${id}`,404)); 
}
  res.status(200).json({data: feedback});
})


// @desc    Create a new Feedback
// @route   POST api/zonetravail/
// @access  Private
exports.createFeedback=asyncHandler(async(req,res)=>{
    const body=req.body
    const feedback=await Feedback.create(body)
     res.status(201).json({data:feedback})
   
});


// @desc    update specified Feedback
// @route   PUT api/zonetravail/:id
// @access  Private
exports.updateFeedback =asyncHandler(async(req,res,next)=>{
  const {id}=req.params;
    const feedback=await Feedback.update(req.body,{where:{id:id}})
    res.status(200).json({message:true});  
})


// @desc    delete specified feedback
// @route   DELETE api/zonetravail/:id
// @access  Private
exports.deleteFeedback=asyncHandler(async(req,res,next)=>{
   const {id}=req.params;
    const deletes=await Feedback.destroy({where:{id:id}})
  res.status(204).send();  
});