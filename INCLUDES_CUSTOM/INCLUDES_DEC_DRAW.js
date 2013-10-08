//Cateogories
var DESC_C1 = "C1_Choice_1_for_Allwith_3_Pref_Points";
var DESC_C2 = "C2_Choice_1_for_LO_and_RESD";
var DESC_C3 = "C3_Choice_1_for_RES_or_NONRES_with_2_Pref_Points";
var DESC_C4 = "C4_Choice_1_for_RES_or_NONRES_with_1_Pref_Point";
var DESC_C5 = "C5_Choice_1_for_RES_or_NONRES_with_no_Pref_Points";
var DESC_C6 = "C6_Choice_1_for_NONRES_with_2_Pref_Points";
var DESC_C7 = "C7_Choice_1_for_NONRES_with_1_Pref_Point";
var DESC_C8 = "C8_Choice_1_for_NONRES_with_no_Pref_Points";
var DESC_C9 = "C9_Choice_2_for_LO_and_RESD";
var DESC_C10 = "C10_Choice_2_for_RES_or_NONRES_with_3_Pref_Points";
var DESC_C11 = "C11_Choice_2_for_RES_or_NONRES_with_2_Pref_Points";
var DESC_C12 = "C12_Choice_2_for_RES_or_NONRES_with_1_Pref_Point";
var DESC_C13 = "C13_Choice_2_for_RES_or_NONRES_with_no_Pref_Points";
var DESC_C14 = "C14_Choice_2_for_NONRES_with_3_Pref_Points";
var DESC_C15 = "C15_Choice_2_for_NONRES_with_2_Pref_Points";
var DESC_C16 = "C16_Choice_2_for_NONRES_with_1_Pref_Point";
var DESC_C17 = "C17_Choice_2_for_NONRES_with_no_Pref_Points";

//Draw Types
var DRAW_IBP = "IBP";
var DRAW_INST = "INSTANT";
var DRAW_FCFS = "FCFS";

//Record Types
var AA_Preference_Order = "Licenses/WMU/Draw/Preference Order";
var AA_Configuration = "Licenses/WMU/Draw/Configure";
var AA_Probability = "Licenses/WMU/Draw/Probability";
var AA_wmu_Process_create = "Licenses/WMU/Process/Create";

function Category(index, nOrder, nProbability, nChoiceType) {
    this.Index = index;
    this.Name = "C" + this.Index.toString();
    this.Description = "DESC_C" + this.Index.toString();
    this.Order = nOrder;
    this.Probability = nProbability;
    this.ChoiceType = nChoiceType; //1 or 2
}
function getOrderForBucket(bucketNum, elements) {
    var retOrder = 0;
    for (var inn = 0; inn < elements.length; inn++) {
        if (bucketNum == parseFloat(elements[inn].index)) {
            retOrder = parseFloat(elements[inn].Order);
        }
    }
    return retOrder;
}
function sortCategoryArray(elements) {
    for (var out = elements.length - 1; out > 0; out--) {
        for (var inn = 0; inn < out; inn++) {
            if (parseFloat(elements[inn].Order) > parseFloat(elements[inn + 1].Order)) {
                var t = elements[inn + 1];
                elements[inn + 1] = elements[inn];
                elements[inn] = t;
            }
        }
    }
    return elements;
}
function Draw_Obj(syear, swmu, schoicenum, sdrawtype, sapplyLandOwner) {
    this.Identity = (syear + swmu + schoicenum + sdrawtype);

    this.Year = syear;
    this.ChoiceNum = schoicenum;
    this.Wmu = swmu;
    this.DrawType = sdrawtype;
    this.ApplyLandowner = sapplyLandOwner;

    this.IsLanOwner = (this.ApplyLandowner != '' && this.ApplyLandowner != null);
    this.IsNyResiDent = false;
    this.IsDisableForYear = false;
    this.IsMilitaryServiceman = false;
    this.PreferencePoints = 0;
    this.Age = new Number(0);
    this.Gender = "";
    this.IsMinor = false;
    this.IsLegallyBlind = false;
    this.IsNativeAmerican = false;
    this.HasHuntEd = false;
    this.HasBowHunt = false;
    this.HasTrapEd = false;
    this.havedefinedItems = false;

    this.DrawResult = new DrawResult_OBJ(this.Wmu, this.DrawType, this.ChoiceNum, this.PreferencePoints, this.IsLanOwner, (this.IsMilitaryServiceman && this.IsDisableForYear), this.IsNyResiDent);

    this.ordbAinfo = null;
    this.PreferenceBucketForIbp = null;

    this.getPreorderAinfo = function () {
        var searchCapId;
        //Get Preference Order
        var ordbAinfo = new Array();
        searchCapId = GenerateAltId(AA_Preference_Order, this.Year, this.Wmu, this.DrawType);
        var ordCapId = getCapId(searchCapId);
        if (ordCapId != null) {
            loadAppSpecific(ordbAinfo, ordCapId);
            //logGlobals(ordbAinfo);
        }
        return ordbAinfo;
    }
    this.RunLottery = function () {
        var year = this.Year;
        var wmu = this.Wmu;
        var drawtype = this.DrawType;
        var ChoiceNum = this.ChoiceNum

        var drawResult = new DrawResult_OBJ();  //Result holder
        if (this.DrawType != DRAW_FCFS && this.DrawType != DRAW_INST && this.DrawType != DRAW_IBP) {
            return drawResult;
        }

        if (this.DrawType == DRAW_FCFS) {
            var bDisabledVet = (drw.IsDisableForYear && drw.IsMilitaryServiceman);
            drawResult = new DrawResult_OBJ(this.Wmu, this.DrawType, this.ChoiceNum, this.PreferencePoints, this.IsLanOwner, bDisabledVet, this.IsNyResiDent);
            drawResult = verifyWmuConfiguration(year, wmu, drawtype, ChoiceNum, drawResult);
            drawResult.SetPreferencePointsAfter();
        } else {
            var searchCapId;
            //Get Preference Order
            var ordbAinfo = new Array();
            if (this.ordbAinfo == null) {
                searchCapId = GenerateAltId(AA_Preference_Order, year, wmu, drawtype);
                var ordCapId = getCapId(searchCapId);
                if (ordCapId != null) {
                    loadAppSpecific(ordbAinfo, ordCapId);
                    //logGlobals(ordbAinfo);
                }
                this.ordbAinfo = ordbAinfo;
            } else {
                ordbAinfo = this.ordbAinfo;
            }

            //Get Probability
            searchCapId = GenerateAltId(AA_Probability, year, wmu, drawtype);
            var probCapId = getCapId(searchCapId);
            var probAinfo = new Array();
            if (probCapId != null) {
                loadAppSpecific(probAinfo, probCapId);
                //logGlobals(probAinfo);
            }

            //create category Array
            var ctgArray = new Array();
            if (probCapId != null && ordCapId != null) {
                ctgArray.push(new Category(1, ordbAinfo["C1"], probAinfo["C1"], 1));
                ctgArray.push(new Category(2, ordbAinfo["C2"], probAinfo["C2"], 1));
                ctgArray.push(new Category(3, ordbAinfo["C3"], probAinfo["C3"], 1));
                ctgArray.push(new Category(4, ordbAinfo["C4"], probAinfo["C4"], 1));
                ctgArray.push(new Category(5, ordbAinfo["C5"], probAinfo["C5"], 1));
                ctgArray.push(new Category(6, ordbAinfo["C6"], probAinfo["C6"], 1));
                ctgArray.push(new Category(7, ordbAinfo["C7"], probAinfo["C7"], 1));
                ctgArray.push(new Category(8, ordbAinfo["C8"], probAinfo["C8"], 1));
                ctgArray.push(new Category(9, ordbAinfo["C9"], probAinfo["C9"], 2));
                ctgArray.push(new Category(10, ordbAinfo["C10"], probAinfo["C10"], 2));
                ctgArray.push(new Category(11, ordbAinfo["C11"], probAinfo["C11"], 2));
                ctgArray.push(new Category(12, ordbAinfo["C12"], probAinfo["C12"], 2));
                ctgArray.push(new Category(13, ordbAinfo["C13"], probAinfo["C13"], 2));
                ctgArray.push(new Category(14, ordbAinfo["C14"], probAinfo["C14"], 2));
                ctgArray.push(new Category(15, ordbAinfo["C15"], probAinfo["C15"], 2));
                ctgArray.push(new Category(16, ordbAinfo["C16"], probAinfo["C15"], 2));
                ctgArray.push(new Category(17, ordbAinfo["C17"], probAinfo["C17"], 2));
            }

            if (ctgArray.length > 0) {
                sortCategoryArray(ctgArray);

                for (var out = 0; out < ctgArray.length; out++) {
                    if (ctgArray[out].ChoiceType == ChoiceNum) {
                        if (this.DrawType == DRAW_INST) {
                            eval('drawResult = verify' + ctgArray[out].Name + '(this);');
                        } else if (this.DrawType == DRAW_IBP) {
                            drawResult = new DrawResult_OBJ(drw.Wmu, drw.DrawType, drw.ChoiceNum, drw.PreferencePoints, drw.IsLanOwner, bDisabledVet, drw.IsNyResiDent);
                            drawResult.Selected = (this.PreferenceBucketForIbp == ctgArray[out].index);
                        }
                        if (drawResult.Selected) {
                            drawResult.PreferenceBucket = ctgArray[out].index;

                            //Decide When to Hit the draw  for instant and IBP
                            if (this.DrawType == DRAW_INST || this.DrawType == DRAW_IBP) {
                                drawResult.Selected = hitDraw(ctgArray[out].Probability);
                            } else {
                                drawResult.Selected = true;
                            }
                            if (!drawResult.Selected) {
                                drawResult = verifyWmuConfiguration(year, wmu, drawtype, ChoiceNum, drawResult);
                                drawResult.SetPreferencePointsAfter();
                            }
                            break;
                        }
                    }
                }
            }
        }

        this.DrawResult = drawResult
        return drawResult;
    }
}
function verifyWmuConfiguration(year, wmu, drawtype, choiceNum, drawResult) {
    drawResult.Selected = false;

    //Get WMU Configuration
    var searchCapId = GenerateAltId(AA_Configuration, year, wmu, drawtype);
    var cnfgCapId = getCapId(searchCapId);
    var cnfgAinfo = new Array();
    if (cnfgCapId != null) {
        loadAppSpecific(cnfgAinfo, cnfgCapId);
        logGlobals(cnfgAinfo);

        var prmitTarget = cnfgAinfo["Permit Target"];
        if (prmitTarget == null) prmitTarget = 0;
        var usedCount = cnfgAinfo["Used Count"];
        if (usedCount == null) usedCount = 0;
        var wmuStatus = cnfgAinfo["Status"];
        var openDt = new Date(cnfgAinfo["Open Date"]);
        var closeDt = new Date(cnfgAinfo["Close Date"]);
        var now = new Date();
        var StatusApplicableTo = cnfgAinfo["Status Applicable To"];

        if (wmuStatus == 'Open') {
            if (StatusApplicableTo == "Both" || StatusApplicableTo == 'WMU Choice ' + drawResult.ChoiceNum) {
                if ((now >= openDt && closeDt <= now)) {
                    if (prmitTarget > 0) {
                        drawResult.Selected = true;
                        prmitTarget--;
                        usedCount++;
                        //Update Configuraion
                        var newAInfo = new Array();
                        newAInfo.push(new NewLicDef("Permit Target", prmitTarget));
                        newAInfo.push(new NewLicDef("Used Count", usedCount));
                        if (drawtype != DRAW_INST) {
                            if (prmitTarget <= 0) {
                                newAInfo.push(new NewLicDef("Status", "Closed"));
                                newAInfo.push(new NewLicDef("Status Effecctive Date", formatMMDDYYYY(now)));
                            }
                        }
                        copyLicASI(cnfgCapId, newAInfo);

                        if (drawtype != DRAW_INST) {
                            if (prmitTarget <= 0) {
                                updateWMUChoiceStatus(wmu, choiceNum, false);
                            }
                        }
                    }
                }
            }
        }
    }
    return drawResult;
}
function updateWMUChoiceStatus(wmu, choiceNum, isActive) {
    //Update WMU Choice Status
    if (choiceNum == '1') {
        editLookupAuditStatus("WMU Choice 1", wmu, isActive ? "A" : "I");
    }
    if (choiceNum == '2') {
        editLookupAuditStatus("WMU Choice 2", wmu, isActive ? "A" : "I");
    }
}
function DrawResult_OBJ(sWmu, sDrawType, sChoiceNum, nPreferencePoints, bLandowner, bDisabledVet, bResident) {
    this.WMU = sWmu;
    this.DrawType = sDrawType;
    this.ChoiceNum = sChoiceNum;
    this.PreferencePoints = nPreferencePoints;
    this.Landowner = bLandowner;
    this.DisabledVet = bDisabledVet;
    this.Resident = bResident;
    this.PreferenceBucket = null;

    this.GivenPreferencePoints = 0;
    this.RemainingPreferencePoints = this.PreferencePoints;
    this.Selected = false;
    this.Result = function () {
        return (this.Selected == true ? "WON" : "LOST");
    };

    this.SetPreferencePointsAfter = function () {
        if (this.ChoiceNum == '1') {
            if (this.Selected) {
                this.PreferencePoints = 0;
                this.RemainingPreferencePoints = this.PreferencePoints;
            }
            else {
                this.PreferencePoints--;
                this.RemainingPreferencePoints = this.PreferencePoints;
                this.GivenPreferencePoints++;
            }
        }
    }
}
function verifyC1(drwParam) {
    var drw = drwParam;
    var bDisabledVet = (drw.IsDisableForYear && drw.IsMilitaryServiceman);
    var result = new DrawResult_OBJ(drw.Wmu, drw.DrawType, drw.ChoiceNum, drw.PreferencePoints, drw.IsLanOwner, bDisabledVet, drw.IsNyResiDent);
    result.Selected = (drw.ChoiceNum == '1' && drw.PreferencePoints >= 3);

    return result;
}
function verifyC2(drwParam) {
    var drw = drwParam;
    var bDisabledVet = (drw.IsDisableForYear && drw.IsMilitaryServiceman);
    var result = new DrawResult_OBJ(drw.Wmu, drw.DrawType, drw.ChoiceNum, drw.PreferencePoints, drw.IsLanOwner, bDisabledVet, drw.IsNyResiDent);
    result.Selected = (drw.ChoiceNum == '1' && bDisabledVet && drw.IsNyResiDent);

    return result;
}
function verifyC3(drwParam) {
    var drw = drwParam;
    var bDisabledVet = (drw.IsDisableForYear && drw.IsMilitaryServiceman);
    var result = new DrawResult_OBJ(drw.Wmu, drw.DrawType, drw.ChoiceNum, drw.PreferencePoints, drw.IsLanOwner, bDisabledVet, drw.IsNyResiDent);
    result.Selected = (drw.ChoiceNum == '1' && drw.PreferencePoints == 2 && drw.havedefinedItems);

    return result;
}
function verifyC4(drwParam) {
    var drw = drwParam;
    var bDisabledVet = (drw.IsDisableForYear && drw.IsMilitaryServiceman);
    var result = new DrawResult_OBJ(drw.Wmu, drw.DrawType, drw.ChoiceNum, drw.PreferencePoints, drw.IsLanOwner, bDisabledVet, drw.IsNyResiDent);
    result.Selected = (drw.ChoiceNum == '1' && drw.PreferencePoints == 1 && drw.havedefinedItems);

    return result;
}
function verifyC5(drwParam) {
    var drw = drwParam;
    var bDisabledVet = (drw.IsDisableForYear && drw.IsMilitaryServiceman);
    var result = new DrawResult_OBJ(drw.Wmu, drw.DrawType, drw.ChoiceNum, drw.PreferencePoints, drw.IsLanOwner, bDisabledVet, drw.IsNyResiDent);
    result.Selected = (drw.ChoiceNum == '1' && drw.PreferencePoints == 0 && drw.havedefinedItems);

    return result;
}
function verifyC6(drwParam) {
    var drw = drwParam;
    var bDisabledVet = (drw.IsDisableForYear && drw.IsMilitaryServiceman);
    var result = new DrawResult_OBJ(drw.Wmu, drw.DrawType, drw.ChoiceNum, drw.PreferencePoints, drw.IsLanOwner, bDisabledVet, drw.IsNyResiDent);
    result.Selected = (drw.ChoiceNum == '1' && drw.PreferencePoints == 2 && !drw.IsNyResiDent);

    return result;
}
function verifyC7(drwParam) {
    var drw = drwParam;
    var bDisabledVet = (drw.IsDisableForYear && drw.IsMilitaryServiceman);
    var result = new DrawResult_OBJ(drw.Wmu, drw.DrawType, drw.ChoiceNum, drw.PreferencePoints, drw.IsLanOwner, bDisabledVet, drw.IsNyResiDent);
    result.Selected = (drw.ChoiceNum == '1' && drw.PreferencePoints == 1 && !drw.IsNyResiDent);

    return result;
}
function verifyC8(drwParam) {
    var drw = drwParam;
    var bDisabledVet = (drw.IsDisableForYear && drw.IsMilitaryServiceman);
    var result = new DrawResult_OBJ(drw.Wmu, drw.DrawType, drw.ChoiceNum, drw.PreferencePoints, drw.IsLanOwner, bDisabledVet, drw.IsNyResiDent);
    result.Selected = (drw.ChoiceNum == '1' && drw.PreferencePoints == 0 && !drw.IsNyResiDent);

    return result;
}
function verifyC9(drwParam) {
    var drw = drwParam;
    var bDisabledVet = (drw.IsDisableForYear && drw.IsMilitaryServiceman);
    var result = new DrawResult_OBJ(drw.Wmu, drw.DrawType, drw.ChoiceNum, drw.PreferencePoints, drw.IsLanOwner, bDisabledVet, drw.IsNyResiDent);
    result.Selected = (drw.ChoiceNum == '2' && drw.IsLanOwner == 0 && drw.IsNyResiDent && bDisabledVet);

    return result;
}
function verifyC10(drwParam) {
    var drw = drwParam;
    var bDisabledVet = (drw.IsDisableForYear && drw.IsMilitaryServiceman);
    var result = new DrawResult_OBJ(drw.Wmu, drw.DrawType, drw.ChoiceNum, drw.PreferencePoints, drw.IsLanOwner, bDisabledVet, drw.IsNyResiDent);
    result.Selected = (drw.ChoiceNum == '2' && drw.PreferencePoints >= 3 && drw.havedefinedItems);

    return result;
}
function verifyC11(drwParam) {
    var drw = drwParam;
    var bDisabledVet = (drw.IsDisableForYear && drw.IsMilitaryServiceman);
    var result = new DrawResult_OBJ(drw.Wmu, drw.DrawType, drw.ChoiceNum, drw.PreferencePoints, drw.IsLanOwner, bDisabledVet, drw.IsNyResiDent);
    result.Selected = (drw.ChoiceNum == '2' && drw.PreferencePoints == 2 && drw.havedefinedItems);

    return result;
}
function verifyC12(drwParam) {
    var drw = drwParam;
    var bDisabledVet = (drw.IsDisableForYear && drw.IsMilitaryServiceman);
    var result = new DrawResult_OBJ(drw.Wmu, drw.DrawType, drw.ChoiceNum, drw.PreferencePoints, drw.IsLanOwner, bDisabledVet, drw.IsNyResiDent);
    result.Selected = (drw.ChoiceNum == '2' && drw.PreferencePoints == 1 && drw.havedefinedItems);

    return result;
}
function verifyC13(drwParam) {
    var drw = drwParam;
    var bDisabledVet = (drw.IsDisableForYear && drw.IsMilitaryServiceman);
    var result = new DrawResult_OBJ(drw.Wmu, drw.DrawType, drw.ChoiceNum, drw.PreferencePoints, drw.IsLanOwner, bDisabledVet, drw.IsNyResiDent);
    result.Selected = (drw.ChoiceNum == '2' && drw.PreferencePoints == 0 && drw.havedefinedItems);

    return result;
}
function verifyC14(drwParam) {
    var drw = drwParam;
    var bDisabledVet = (drw.IsDisableForYear && drw.IsMilitaryServiceman);
    var result = new DrawResult_OBJ(drw.Wmu, drw.DrawType, drw.ChoiceNum, drw.PreferencePoints, drw.IsLanOwner, bDisabledVet, drw.IsNyResiDent);
    result.Selected = (drw.ChoiceNum == '2' && drw.PreferencePoints >= 3 && !drw.IsNyResiDent);

    return result;
}
function verifyC15(drwParam) {
    var drw = drwParam;
    var bDisabledVet = (drw.IsDisableForYear && drw.IsMilitaryServiceman);
    var result = new DrawResult_OBJ(drw.Wmu, drw.DrawType, drw.ChoiceNum, drw.PreferencePoints, drw.IsLanOwner, bDisabledVet, drw.IsNyResiDent);
    result.Selected = (drw.ChoiceNum == '2' && drw.PreferencePoints == 2 && !drw.IsNyResiDent);

    return result;
}
function verifyC16(drwParam) {
    var drw = drwParam;
    var bDisabledVet = (drw.IsDisableForYear && drw.IsMilitaryServiceman);
    var result = new DrawResult_OBJ(drw.Wmu, drw.DrawType, drw.ChoiceNum, drw.PreferencePoints, drw.IsLanOwner, bDisabledVet, drw.IsNyResiDent);
    result.Selected = (drw.ChoiceNum == '2' && drw.PreferencePoints == 1 && !drw.IsNyResiDent);

    return result;
}
function verifyC17(drwParam) {
    var drw = drwParam;
    var bDisabledVet = (drw.IsDisableForYear && drw.IsMilitaryServiceman);
    var result = new DrawResult_OBJ(drw.Wmu, drw.DrawType, drw.ChoiceNum, drw.PreferencePoints, drw.IsLanOwner, bDisabledVet, drw.IsNyResiDent);
    result.Selected = (drw.ChoiceNum == '2' && drw.PreferencePoints == 0 && !drw.IsNyResiDent);

    return result;
}
function createDrawSettings(year, wfNewTask) {
    logDebug("ENTER: createDrawSettings");

    ///STEP 1: Set drawtype accprding to task 
    var drawtype = '';
    if (wfNewTask == 'Init') {
        drawtype = DRAW_INST;
    }
    if (wfNewTask == 'Close Instant Lottery') {
        //DO Nothing
        drawtype = 'NA';
    }
    if (wfNewTask == 'Close IBP Lottery') {
        drawtype = DRAW_IBP;
    }
    if (wfNewTask == 'Close FCFS Lottery') {
        drawtype = DRAW_FCFS;
    }
    if (wfNewTask == 'Close Draw Processs') {
        //DO Nothing
        drawtype = 'NA';
    }

    logDebug("RECORD Creation for: " + drawtype);

    ///STEP 2: Create new settings for drawtype and close source (last or previous drawtype record) 
    var strControl = "WMU";
    if (drawtype == DRAW_INST) {
        createPreorder(year, drawtype);
    }
    var bizDomScriptResult = aa.bizDomain.getBizDomain(strControl);
    if (bizDomScriptResult.getSuccess()) {
        bizDomScriptArray = bizDomScriptResult.getOutput().toArray()
        for (var i in bizDomScriptArray) {
            //logDebug(bizDomScriptArray[i].getBizdomainValue());
            if (bizDomScriptArray[i].getBizdomainValue() != 'NA' && bizDomScriptArray[i].getBizdomainValue() != 'I don\'t know') {
                if (drawtype != 'NA') {
                    createWmuConfiguration(year, bizDomScriptArray[i].getBizdomainValue(), drawtype);
                    createWmuProbability(year, bizDomScriptArray[i].getBizdomainValue(), drawtype);
                } else {
                    if (wfNewTask == 'Close Draw Processs') {
                        closeWmuSettingsForFCFS(year, bizDomScriptArray[i].getBizdomainValue(), DRAW_FCFS);
                    }
                }
            }
            //if (i == 0) break;
        }
    }
    if (drawtype == DRAW_INST) {
        var newCustomId = GenerateAltId(AA_wmu_Process_create, year, "", drawtype);
        editAppName(GetAppName(AA_wmu_Process_create, year, "", drawtype), capId);
        updateDocumentNumber(newCustomId);
    }
    ///

    ///STEP 3: Automated tasks
    if (wfNewTask == 'Init') {
        closeTask("Init", "Initialized", "Updated via script.", "");
    }
    if (wfNewTask == 'Close Draw Processs') {
        closeTask("Close Draw Processs", "Closed", "Updated via script.", "");
    }

    logDebug("EXIT: createDrawSettings");
}

//Create Preorder settings using last year settings, if available
function createPreorder(year, drawtype) {
    logDebug("ENTER: createPreorder");
    var ats = AA_Preference_Order;
    var ata = ats.split("/");

    if (ata.length != 4) {
        logDebug("**ERROR in createPreorder.  The following Application Type String is incorrectly formatted: " + ats);
    } else {
        var searchCapId = GenerateAltId(ats, year, "", drawtype);
        var currCapId = getCapId(searchCapId);

        if (currCapId == null) {
            var prevYear = (parseInt(year, 10) - 1).toString();

            var srcCapId = getCapId(GenerateAltId(ats, prevYear, "", drawtype));
            var newCapId = createDrawSettingRecords(ata[0], ata[1], ata[2], ata[3], "Open");
            editAppName(GetAppName(ats, year, "", drawtype), newCapId);

            var newAInfo = new Array();
            if (srcCapId != null) {
                copyASIFields(srcCapId, newCapId);

                newAInfo.push(new NewLicDef("License Year", year));
                copyLicASI(newCapId, newAInfo);
            } else {
                newAInfo.push(new NewLicDef("License Year", year));

                newAInfo.push(new NewLicDef("C1", 1));
                newAInfo.push(new NewLicDef("C2", 2));
                newAInfo.push(new NewLicDef("C3", 3));
                newAInfo.push(new NewLicDef("C4", 4));
                newAInfo.push(new NewLicDef("C5", 5));
                newAInfo.push(new NewLicDef("C6", 6));
                newAInfo.push(new NewLicDef("C7", 7));
                newAInfo.push(new NewLicDef("C8", 8));
                newAInfo.push(new NewLicDef("C9", 9));
                newAInfo.push(new NewLicDef("C10", 10));
                newAInfo.push(new NewLicDef("C11", 11));
                newAInfo.push(new NewLicDef("C12", 12));
                newAInfo.push(new NewLicDef("C13", 13));
                newAInfo.push(new NewLicDef("C14", 14));
                newAInfo.push(new NewLicDef("C15", 15));
                newAInfo.push(new NewLicDef("C16", 16));
                newAInfo.push(new NewLicDef("C17", 17));
                copyLicASI(newCapId, newAInfo);
            }
            var newCustomId = GenerateAltId(ats, year, "", drawtype);
            updateDocumentNumber(newCustomId, newCapId);
        }
    }
    logDebug("EXIT: createPreorder");
}

//Create WMU configuration settings using last year / ;ast draw tpe for this year, if available
function createWmuConfiguration(year, wmu, drawtype) {
    logDebug("ENTER: createWmuConfiguration");
    var ats = AA_Configuration;
    var ata = ats.split("/");

    if (ata.length != 4) {
        logDebug("**ERROR in createWmuConfiguration.  The following Application Type String is incorrectly formatted: " + ats);
    } else {
        var searchCapId = GenerateAltId(ats, year, wmu, drawtype);
        var currCapId = getCapId(searchCapId);

        if (currCapId == null) {
            var now = new Date();
            var prevYear = (parseInt(year, 10) - 1).toString();
            var nextYear = (parseInt(year, 10) + 1).toString();

            var srcCapId = null;
            if (drawtype == DRAW_INST) {
                srcCapId = getCapId(GenerateAltId(ats, prevYear, wmu, DRAW_FCFS));
            }
            if (drawtype == DRAW_IBP) {
                srcCapId = getCapId(GenerateAltId(ats, year, wmu, DRAW_INST));
            }
            if (drawtype == DRAW_FCFS) {
                srcCapId = getCapId(GenerateAltId(ats, year, wmu, DRAW_IBP));
            }

            var newCapId = createDrawSettingRecords(ata[0], ata[1], ata[2], ata[3], "Open");
            editAppName(GetAppName(ats, year, wmu, drawtype), newCapId);

            var newAInfo = new Array();
            if (srcCapId != null) {
                copyASIFields(srcCapId, newCapId);

                newAInfo.push(new NewLicDef("Draw Type", drawtype));
                newAInfo.push(new NewLicDef("License Year", year));
                newAInfo.push(new NewLicDef("Open Date", dateFormatted('8', '15', year.toString())));
                newAInfo.push(new NewLicDef("Close Date", dateFormatted('9', '30', nextYear.toString())));
                newAInfo.push(new NewLicDef("Status", 'Open'));
                newAInfo.push(new NewLicDef("Status Effecctive Date", jsDateToASIDate(now)));
                newAInfo.push(new NewLicDef("Status Applicable To", 'Both'));
                newAInfo.push(new NewLicDef("Used Count", 0));

                copyLicASI(newCapId, newAInfo);

                if (drawtype == DRAW_IBP || drawtype == DRAW_FCFS) {
                    closeTaskForRec("Open", "Closed", "", "", "", srcCapId);
                }

            } else {
                newAInfo.push(new NewLicDef("Draw Type", drawtype));
                newAInfo.push(new NewLicDef("WMU", wmu));
                newAInfo.push(new NewLicDef("License Year", year));

                newAInfo.push(new NewLicDef("Permit Target", 0));
                newAInfo.push(new NewLicDef("Open Date", dateFormatted('8', '15', year.toString())));
                newAInfo.push(new NewLicDef("Close Date", dateFormatted('9', '30', nextYear.toString())));
                newAInfo.push(new NewLicDef("Status", 'Open'));
                newAInfo.push(new NewLicDef("Status Effecctive Date", jsDateToASIDate(now)));
                newAInfo.push(new NewLicDef("Status Applicable To", 'Both'));
                newAInfo.push(new NewLicDef("Used Count", 0));

                copyLicASI(newCapId, newAInfo);
            }
            var newCustomId = GenerateAltId(ats, year, wmu, drawtype);
            updateDocumentNumber(newCustomId, newCapId);
        }
    }
    logDebug("EXIT: createWmuConfiguration");
}

//Create WMU probability settings using last year / ;ast draw tpe for this year, if available
function createWmuProbability(year, wmu, drawtype) {
    logDebug("ENTER: createWmuProbability");
    var ats = AA_Probability;
    var ata = ats.split("/");

    if (ata.length != 4) {
        logDebug("**ERROR in createWmuProbability.  The following Application Type String is incorrectly formatted: " + ats);
    } else {
        var searchCapId = GenerateAltId(ats, year, wmu, drawtype);
        var currCapId = getCapId(searchCapId);

        if (currCapId == null) {
            var prevYear = (parseInt(year, 10) - 1).toString();

            var srcCapId = null;
            if (drawtype == DRAW_INST) {
                srcCapId = getCapId(GenerateAltId(ats, prevYear, wmu, DRAW_INST));
            }
            if (drawtype == DRAW_IBP) {
                srcCapId = getCapId(GenerateAltId(ats, year, wmu, DRAW_INST));
            }
            if (drawtype == DRAW_FCFS) {
                srcCapId = getCapId(GenerateAltId(ats, year, wmu, DRAW_IBP));
            }

            var newCapId = createDrawSettingRecords(ata[0], ata[1], ata[2], ata[3], "Open");
            editAppName(GetAppName(ats, year, wmu, drawtype), newCapId);

            var newAInfo = new Array();
            if (srcCapId != null) {
                copyASIFields(srcCapId, newCapId);

                newAInfo.push(new NewLicDef("Draw Type", drawtype));
                newAInfo.push(new NewLicDef("License Year", year));
                copyLicASI(newCapId, newAInfo);
                if (drawtype == DRAW_IBP || drawtype == DRAW_FCFS) {
                    closeTaskForRec("Open", "Closed", "", "", "", srcCapId);
                }
            } else {
                newAInfo.push(new NewLicDef("License Year", year));
                newAInfo.push(new NewLicDef("Draw Type", drawtype));
                newAInfo.push(new NewLicDef("WMU", wmu));

                newAInfo.push(new NewLicDef("C1", 1));
                newAInfo.push(new NewLicDef("C2", 1));
                newAInfo.push(new NewLicDef("C3", 1));
                newAInfo.push(new NewLicDef("C4", 1));
                newAInfo.push(new NewLicDef("C5", 1));
                newAInfo.push(new NewLicDef("C6", 1));
                newAInfo.push(new NewLicDef("C7", 1));
                newAInfo.push(new NewLicDef("C8", 1));
                newAInfo.push(new NewLicDef("C9", 1));
                newAInfo.push(new NewLicDef("C10", 1));
                newAInfo.push(new NewLicDef("C11", 1));
                newAInfo.push(new NewLicDef("C12", 1));
                newAInfo.push(new NewLicDef("C13", 1));
                newAInfo.push(new NewLicDef("C14", 1));
                newAInfo.push(new NewLicDef("C15", 1));
                newAInfo.push(new NewLicDef("C16", 1));
                newAInfo.push(new NewLicDef("C17", 1));
                copyLicASI(newCapId, newAInfo);
            }
            var newCustomId = GenerateAltId(ats, year, wmu, drawtype);
            updateDocumentNumber(newCustomId, newCapId);
        }
    }
    logDebug("EXIT: createWmuProbability");
}

//Close WMU all settings for the year after FCFS closed.
function closeWmuSettingsForFCFS(year, wmu, drawtype) {
    logDebug("ENTER: closeWmuSettingsForFCFS");
    var ats = AA_Probability;
    srcCapId = getCapId(GenerateAltId(ats, year, wmu, DRAW_FCFS));
    closeTaskForRec("Open", "Closed", "", "", "", srcCapId);

    ats = AA_Configuration;
    srcCapId = getCapId(GenerateAltId(ats, year, wmu, DRAW_FCFS));
    closeTaskForRec("Open", "Closed", "", "", "", srcCapId);

    ats = AA_Preference_Order;
    srcCapId = getCapId(GenerateAltId(ats, year, "", DRAW_FCFS));
    closeTaskForRec("Open", "Closed", "", "", "", srcCapId);

    logDebug("EXIT: closeWmuSettingsForFCFS");
}

//Create record for passed 4 level structure
function createDrawSettingRecords(typeLevel1, typeLevel2, typeLevel3, typeLevel4, initStatus) {
    logDebug("ENTER: createDrawSettingRecords");

    //typeLevel3 - record status to set the license to initially						
    //typeLevel4 - copy ASI from Application to License? (true/false)						
    //createRefLP - create the reference LP (true/false)						

    var newLic = null;
    var newLicId = null;
    var newLicIdString = null;

    //create the license record						
    newLicId = createChild(typeLevel1, typeLevel2, typeLevel3, typeLevel4, null);
    newLicIdString = newLicId.getCustomID();

    logDebug("EXIT: createDrawSettingRecords");
    return newLicId;
}

// returns the cap Id string of an application that has group,type,subtype,categoryand name
function getAppIdByName(gaGroup, gaType, gaSubType, gaCategory, gaName) {
    //OBSOLETE  
    getCapResult = aa.cap.getByAppType(gaGroup, gaType, gaSubType, gaCategory);
    if (getCapResult.getSuccess())
        var apsArray = getCapResult.getOutput();
    else {
        logDebug("**ERROR: getting caps by app type: " + getCapResult.getErrorMessage());
        return null;
    }

    for (aps in apsArray) {
        var myCap = aa.cap.getCap(apsArray[aps].getCapID()).getOutput();
        if (myCap.getSpecialText().equals(gaName)) {
            logDebug("getAppIdByName(" + gaGroup + "," + gaType + "," + gaSubType + "," + gaCategory + "," + gaName + ") Returns " + apsArray[aps].getCapID().toString());
            return apsArray[aps].getCapID().toString();
        }
    }
    return null;
}

//Get Application name
function GetAppName(rectype, year, wmu, drawtype) {
    logDebug("ENTER: GetAppName");
    var appName = null;
    if (rectype == AA_Preference_Order) {
        appName = year + " Preference Order";
    }
    if (rectype == AA_Probability) {
        appName = year + " " + wmu + " Probability - " + drawtype;
    }
    if (rectype == AA_Configuration) {
        appName = year + " " + wmu + " Configuration - " + drawtype;
    }
    if (rectype == AA_wmu_Process_create) {
        appName = year + " WMU Process";
    }

    logDebug("EXIT: GetAppName");
    return appName;
}

//Get Alt ID
function GenerateAltId(rectype, year, wmu, drawtype) {
    logDebug("ENTER: GenerateAltId");
    var altId = null;
    if (rectype == AA_Preference_Order) {
        altId = year + " Pref Order";
    }
    if (rectype == AA_Probability) {
        altId = year + " " + wmu + " Prob - " + drawtype;
    }
    if (rectype == AA_Configuration) {
        altId = year + " " + wmu + " Config - " + drawtype;
    }
    if (rectype == AA_wmu_Process_create) {
        altId = year + " WMU Process";
    }
    logDebug("EXIT: GenerateAltId");
    return altId;
}
function randomNum() {
    for (i = 1; i < 100; i++) {
        aa.print(Math.round(Math.random(1) * 10))
    }
}
function hitDraw(nProbability) {
    if (nProbability == 1) {
        return true;
    }
    if (nProbability == 0) {
        return false;
    }
    var rndNum = Math.random(100.00) * 10;
    var probNum = parseFloat(nProbability) * 10;
    return rndNum <= probNum;
}
function processMutpleupdate(year) {
    showMessage = true;

    try {
        var drawtype = '';
        if (isTaskActive('Init')) {
            //DO Nothing
            drawtype = 'NA';
        }
        if (isTaskActive('Close Instant Lottery')) {
            drawtype = DRAW_INST;
        }
        if (isTaskActive('Close IBP Lottery')) {
            drawtype = DRAW_IBP;
        }
        if (isTaskActive('Close FCFS Lottery')) {
            drawtype = DRAW_FCFS;
        }
        if (isTaskActive('Close Draw Processs')) {
            //DO Nothing
            drawtype = 'NA';
        }

        var year = AInfo["License Year"];
        logDebug(year);
        logDebug(drawtype);
        if (drawtype != 'NA') {

            var newAInfo = new Array();
            //if (parseInt(isNull(AInfo["Permit Target"], -1)) > 0) {
            newAInfo.push(new NewLicDef("Permit Target", AInfo["Permit Target"]));
            //}
            newAInfo.push(new NewLicDef("Open Date", AInfo["Close Date"]));
            newAInfo.push(new NewLicDef("Close Date", AInfo["Close Date"]));
            newAInfo.push(new NewLicDef("Status", AInfo["Status"]));
            newAInfo.push(new NewLicDef("Status Effecctive Date", AInfo["Status Effecctive Date"]));
            newAInfo.push(new NewLicDef("Status Applicable To", AInfo["Status Applicable To"]));

            var strControl = "WMU";
            var bizDomScriptResult = aa.bizDomain.getBizDomain(strControl);
            if (bizDomScriptResult.getSuccess()) {
                bizDomScriptArray = bizDomScriptResult.getOutput().toArray()
                for (var i in bizDomScriptArray) {
                    var wmu = bizDomScriptArray[i].getBizdomainValue()
                    if (wmu != 'NA' && wmu != 'don\'t know') {
                        if (AInfo[wmu] == "CHECKED") {
                            var searchCapId = GenerateAltId(AA_Configuration, year, wmu, drawtype);
                            var currCapId = getCapId(searchCapId);
                            copyLicASI(currCapId, newAInfo);
                        }
                    }
                }
            }
        }
        comment("Configuration updated successfully.");
    }
    catch (err) {
        showDebug = 3;
        logDebug("**ERROR An error occured in the processMutpleupdate. Error:  " + err.message);
    }
}