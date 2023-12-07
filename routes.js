import express from "express";
import getNames from "./Controllers/getNames.js";
import getDetails from "./Controllers/getDetails.js";
const router=express.Router();


router.get("/getNames",getNames);
router.get("/getDetails/:id", getDetails);


export {router};