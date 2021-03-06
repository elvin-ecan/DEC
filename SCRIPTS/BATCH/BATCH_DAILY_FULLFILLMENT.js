/*------------------------------------------------------------------------------------------------------/
| Program:  BATCH_DAILY_FULLFILLMENT.js  Trigger: Batch
| Event   : N/A
| Usage   : Batch job (Daily)
| Agency  : DEC
| Purpose : Batch to create set for daily fullfillment.
| Notes   : 08/02/2013,     Lalit S Gawad (LGAWAD),     Initial Version 
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| START: TEST PARAMETERS
/------------------------------------------------------------------------------------------------------*/
//aa.env.setValue("setPrefix", "DAILY");
//aa.env.setValue("emailAddress", "lalit@gcomsoft.com");
//aa.env.setValue("showDebug", "Y");
//aa.env.setValue("reportName", "License Tags");
/*------------------------------------------------------------------------------------------------------/
| END: TEST PARAMETERS
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| START: USER CONFIGURABLE PARAMETERS
/------------------------------------------------------------------------------------------------------*/
var emailText = "";
var maxSeconds = 4.5 * 60; 	    // number of seconds allowed for batch processing, usually < 5*60
var message = "";
var br = "<br>";
/*------------------------------------------------------------------------------------------------------/
| END: USER CONFIGURABLE PARAMETERS
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| BEGIN Includes
/------------------------------------------------------------------------------------------------------*/
SCRIPT_VERSION = 2.0
eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS"));
eval(getScriptText("INCLUDES_BATCH"));
eval(getScriptText("INCLUDES_CUSTOM"));

function getScriptText(vScriptName) {
    vScriptName = vScriptName.toUpperCase();
    var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
    var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");
    return emseScript.getScriptText() + "";
}
/*------------------------------------------------------------------------------------------------------/
| START: BATCH PARAMETERS
/------------------------------------------------------------------------------------------------------*/
var emailAddress = getParam("emailAddress"); 				// email to send report
var setPrefix = getParam("setPrefix"); 						//   Prefix for set ID
var reportName = getParam("reportName");     // Report Name From Report Manager
/*------------------------------------------------------------------------------------------------------/
| END: BATCH PARAMETERS
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| START: Variable Definitions
/------------------------------------------------------------------------------------------------------*/
var servProvCode = aa.getServiceProviderCode();
var showDebug = isNull(aa.env.getValue("showDebug"), "N") == "Y";
var batchJobID = 0;
var batchJobName = "";
var batchJobDesc = "";
var batchJobResult = "";
var systemUserObj = aa.person.getUser("ADMIN").getOutput();
var sysDate = aa.date.getCurrentDate();
var currentUser = aa.person.getCurrentUser().getOutput();
var startDate = new Date();
var startTime = startDate.getTime(); 		// Start timer
var appTypeArray = new Array();
var showDebug = isNull(aa.env.getValue("showDebug"), "N") == "Y";
/*------------------------------------------------------------------------------------------------------/
| END: Variable Definitions
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| START: MAIN LOGIC
/-----------------------------------------------------------------------------------------------------*/
var isPartialSuccess = false;
var timeExpired = false;
var sysDate = aa.date.getCurrentDate();
var sysDateMMDDYYYY = dateFormatted(sysDate.getMonth(), sysDate.getDayOfMonth(), sysDate.getYear(), "");
var currentUser = aa.person.getCurrentUser().getOutput();
var currentUserID = currentUser == null ? "ADMIN" : currentUser.getUserID().toString()
//var AInfo = new Array();
var capId = null;
//var useAppSpecificGroupName = false; // Use Group name when populating App Specific Info Values
var CONST_RECORDS_PER_SET = 50;

logDebug("Start of Job");

if (!timeExpired) var isSuccess = mainProcess();
logDebug("End of Job: Elapsed Time : " + elapsed() + " Seconds");
if (isSuccess) {
    aa.print("Passed");
    aa.env.setValue("ScriptReturnCode", "0");
    if (isPartialSuccess) {
        aa.env.setValue("ScriptReturnMessage", "A script timeout has caused partial completion of this process.  Please re-run.");
        aa.eventLog.createEventLog("Batch Job run partial successful.", "Batch Process", batchJobName, sysDate, sysDate, batchJobDesc, batchJobResult, batchJobID);
    } else {
        aa.env.setValue("ScriptReturnMessage", "Batch Job run successfully.");
        aa.eventLog.createEventLog("Batch Job run successfully.", "Batch Process", batchJobName, sysDate, sysDate, batchJobDesc, batchJobResult, batchJobID);
    }
}
else {
    aa.print("Failed");
    aa.env.setValue("ScriptReturnCode", "1");
    aa.env.setValue("ScriptReturnMessage", "Batch Job failed: " + emailText);
}

if (emailAddress.length)
    aa.sendMail("noreply@accela.com", emailAddress, "", batchJobName + " Results", emailText);
/*------------------------------------------------------------------------------------------------------/
| END: MAIN LOGIC
/-----------------------------------------------------------------------------------------------------*/

function mainProcess() {
    var vError = null;
    try {
        var vSuccess = checkBatch();
        if (!vSuccess) return false;

        logDebug("****** Start logic ******");

        vSuccess = SetDailyFullfillmentLogic();

        logDebug("****** End logic ******");

        return vSuccess;
    }
    catch (vError) {
        logDebug("Runtime error occurred: " + vError);
        return false;
    }
}

function checkBatch() {
    var vBatchJobResult = aa.batchJob.getJobID();
    batchJobName = "" + aa.env.getValue("BatchJobName");

    if (vBatchJobResult.getSuccess()) {
        batchJobID = vBatchJobResult.getOutput();
        logDebug("Batch job ID found " + batchJobID);
        return true;
    }
    else {
        logDebug("Batch job ID not found " + vBatchJobResult.getErrorMessage());
        return false;
    }
}

function SetDailyFullfillmentLogic() {
    var isValid = true;
    if (reportName == '') {
        showDebug = true;
        logDebug("Reporname parameter is not blank. ");
        isValid = false;
    }
    if (setPrefix == '') {
        showDebug = true;
        logDebug("setPrefix parameter is not blank. ");
        isValid = false;
    }
    if (!isValid) {
        return false;
    }

    var uniqueCapIdArray = aa.util.newHashMap();
    var counter = 0;
    var recId;
    var setNameArray = new Array();

    //Set Comments: Initialized, Processing, Successfully processed
    //Set Status: Initialized, Pending, Completed
    var setResult;
    var id;
    if (counter == 0 && setPrefix.length > 0) {
        setResult = createFullfillmentSet(setPrefix);
        id = setResult.setID;
        setNameArray.push(setResult.setID);
        updateSetStatusX(setResult.setID, setResult.setID, "FULLFILLMENT", "Processing", "Pending", "Pending");
        uniqueCapIdArray = aa.util.newHashMap();
        var settprocess = new capSet(setResult.setID);
        var vSetMembers = settprocess.members;
        for (thisCap in vSetMembers) {
            recId = vSetMembers[thisCap]
            if (!uniqueCapIdArray.containsKey(recId)) {
                uniqueCapIdArray.put(recId, recId);
            }
        }
    }
    logDebug("Hash map: " + uniqueCapIdArray);
    var ffConitions = new COND_FULLFILLMENT();
    var ffCondArray = new Array()
    ffCondArray.push(ffConitions.Condition_DailyInternetSales)
    ffCondArray.push(ffConitions.Condition_DailyCallCenterSales)
    //ffCondArray.push(ffConitions.Condition_NeedHuntingEd)
    //ffCondArray.push(ffConitions.Condition_VerifyAgedIn)

    var recordTypeArray = new Array()
    recordTypeArray.push("Licenses/Annual/Application/NA");
    recordTypeArray.push("Licenses/Sales/Reprint/Documents");
    recordTypeArray.push("Licenses/Sales/Upgrade/Lifetime");
    recordTypeArray.push('Licenses/Sales/Application/Fishing');
    recordTypeArray.push('Licenses/Sales/Application/Hunting');
    recordTypeArray.push('Licenses/Sales/Application/Hunting and Fishing');
    recordTypeArray.push('Licenses/Sales/Application/Trapping');
    recordTypeArray.push('Licenses/Sales/Application/Lifetime');
    recordTypeArray.push('Licenses/Sales/Application/Sporting');
    recordTypeArray.push('Licenses/Sales/Application/Marine Registry');
    recordTypeArray.push('Licenses/Sales/Application/Fishing C');
    recordTypeArray.push('Licenses/Sales/Application/Hunting C');
    recordTypeArray.push('Licenses/Sales/Application/Hunting and Fishing C');
    recordTypeArray.push('Licenses/Sales/Application/Trapping C');
    recordTypeArray.push('Licenses/Sales/Application/Lifetime C');
    recordTypeArray.push('Licenses/Sales/Application/Sporting C');
    recordTypeArray.push('Licenses/Sales/Application/Marine Registry C');

    for (var yy in recordTypeArray) {
        var ats = recordTypeArray[yy];
        //logDebug(ats);
        var ata = ats.split("/");

        var emptyCm = aa.cap.getCapModel().getOutput();
        var emptyCt = emptyCm.getCapType();
        emptyCt.setGroup(ata[0]);
        emptyCt.setType(ata[1]);
        emptyCt.setSubType(ata[2]);
        emptyCt.setCategory(ata[3]);

        emptyCm.setCapType(emptyCt);
        emptyCm.setCapStatus("Approved");

        for (var ff in ffCondArray) {
            var isDailyInternetSales = (ffCondArray[ff] == ffConitions.Condition_DailyInternetSales);
            var emCondm = ffConitions.getConditionByFullfillmentType(ffCondArray[ff]);
            emCondm.setConditionStatus("Applied");
            emCondm.setConditionStatusType("Applied");

            if (emCondm != null) {
                emptyCm.setCapConditionModel(emCondm);

                var res = aa.cap.getCapIDListByCapModel(emptyCm);
                if (res.getSuccess()) {
                    var vCapList = res.getOutput();
                    for (thisCap in vCapList) {
                        logDebug("Processing Cap ID: " + recId);
                        /*
                        if (elapsed() > maxSeconds) // only continue if time hasn't expired
                        {
                        isPartialSuccess = true;
                        showDebug = true;
                        logDebug("A script timeout has caused partial completion of this process.  Please re-run.  " + elapsed() + " seconds elapsed, " + maxSeconds + " allowed.");
                        timeExpired = true;
                        break;
                        }
                        */
                        recId = vCapList[thisCap].getCapID();

                        var conditions = aa.capCondition.getCapConditions(recId);
                        var generateReportFlag = 0;
                        if (conditions.getSuccess()) {
                            conditions = conditions.getOutput();
                            for (i in conditions) {
                                logDebug("Condition details: " + conditions[i].getConditionDescription() + " " + conditions[i].getConditionStatus());
                                if ((conditions[i].getConditionDescription().equalsIgnoreCase("Need Hunting Ed") && conditions[i].getConditionStatus().equalsIgnoreCase("Applied")) || (conditions[i].getConditionDescription().equalsIgnoreCase("Verify Aged-In") && conditions[i].getConditionStatus().equalsIgnoreCase("Applied"))) {
                                    generateReportFlag = 1;
                                    logDebug("Don't generate report");
                                    break;
                                }
                            }
                        }
                        if (generateReportFlag == 0) {
                            var counterOtherThanFish = 1;
                            if (isDailyInternetSales) {
                                counterOtherThanFish = 0;
                                var searchAppTypeString = "Licenses/*/*/*";
                                var capArray = getChildren(searchAppTypeString, recId);
                                if (capArray != null) {
                                    for (y in capArray) {
                                        var childCapId = capArray[y];
                                        var currcap = aa.cap.getCap(childCapId).getOutput();
                                        appTypeString = currcap.getCapType().toString();

                                        var validArray = new Array();
                                        validArray.push(AA01_FISHING_LICENSE);
                                        validArray.push(AA03_ONE_DAY_FISHING_LICENSE);
                                        validArray.push(AA22_FRESHWATER_FISHING);
                                        validArray.push(AA23_NONRES_FRESHWATER_FISHING);
                                        validArray.push(AA24_NONRESIDENT_1_DAY_FISHING);
                                        validArray.push(AA25_NONRESIDENT_7_DAY_FISHING);
                                        validArray.push(AA26_SEVEN_DAY_FISHING_LICENSE);
                                        validArray.push(AA02_MARINE_REGISTRY);
                                        validArray.push(AA54_TAG_PRIV_PANEL);
                                        validArray.push(AA16_HABITAT_ACCESS_STAMP);
                                        validArray.push(AA17_VENISON_DONATION);
                                        validArray.push(AA18_CONSERVATION_FUND);
                                        validArray.push(AA19_TRAIL_SUPPORTER_PATCH);
                                        validArray.push(AA20_CONSERVATIONIST_MAGAZINE);
                                        validArray.push(AA21_CONSERVATION_PATRON);
                                        validArray.push(AA43_LIFETIME_CARD_REPLACE);
                                        validArray.push(AA15_TRAPPING_LICENSE);
                                        validArray.push(AA41_NONRESIDENT_TRAPPING);

                                        if (!exists(appTypeString, validArray)) {
                                            counterOtherThanFish++;
                                            break;
                                        }
                                    }
                                }
                            }

                            if (!uniqueCapIdArray.containsKey(recId)) {
                                uniqueCapIdArray.put(recId, recId);
                                var recca = String(recId).split("-");
                                var itemCapId = aa.cap.getCapID(recca[0], recca[1], recca[2]).getOutput();
                                //aa.print("Cap ID: " + itemCapId);
                                var itemCap = aa.cap.getCap(itemCapId).getOutput();
                                altId = itemCapId.getCustomID();
                                if (counterOtherThanFish > 0) {
                                    logDebug("Custom ID for report: " + altId);
                                    //appTypeResult = itemCap.getCapType();
                                    //appTypeString = appTypeResult.toString();
                                    var isSuccess = generateReport(itemCapId);
                                    //logDebug("Report file: " + reportFileName);
                                    if (setPrefix.length > 0) {
                                        addCapSetMemberX(itemCapId, setResult);
                                    }
                                    counter++;
                                }
                            }

                            editCapConditionStatus("Fulfillment", ffCondArray[ff], "Verified", "Not Applied", "", itemCapId);
                            removeFullfillmentCapCondition(itemCapId, ffCondArray[ff]);
                            if (counter >= CONST_RECORDS_PER_SET && setPrefix.length > 0) {
                                (!isPartialSuccess)
                                {
                                    updateSetStatusX(setResult.setID, setResult.setID, "FULLFILLMENT", "Successfully processed", "Ready For Fullfillment", "Ready For Fullfillment");

                                    setResult = createFullfillmentSet(setPrefix);
                                    setNameArray.push(setResult.setID);
                                    updateSetStatusX(setResult.setID, setResult.setID, "FULLFILLMENT", "Processing", "Pending", "Pending");
                                    uniqueCapIdArray = aa.util.newHashMap();
                                }
                                counter = 0;
                            }
                        }
                    }
                }
            }
        }
    }

    logDebug("Updated set status");
    updateSetStatusX(setResult.setID, setResult.setID, "FULLFILLMENT", "Successfully processed", "Ready For Fullfillment", "Ready For Fullfillment");

    logDebug("ENTER: Pass 2 to create missing documenets in EDMS.");
    var counter = 2;
    while (counter > 0) {
        for (y in setNameArray) {
            logDebug("GenerateMissingReportForSets for - " + setNameArray[y]);
            GenerateMissingReportForSets(setNameArray[y] + "");
        }
        counter--;
    }
    logDebug("EXIT: Pass 2 to create missing documenets in EDMS.");

    return true;
}

function createFullfillmentSet(recordType) {
    var id = recordType;
    var name = null;
    var setType = "FULLFILLMENT"; //configured Set Type 
    var setStatus = "Initialized";
    var setComment = "Initialized";
    var setStatusComment = "Initialized";
    return createSetbylogic(id, name, setType, setComment, setStatus, setStatusComment)
}

function addCapSetMemberX(itemCapId, setResult) {
    try {
        logDebug("inside addCapSetMemberX");
        var cID = itemCapId.getCustomID();
        var memberCapID = aa.cap.getCapID(cID).getOutput();
        logDebug("ID: " + memberCapID);
        var addResult = aa.set.addCapSetMember((setResult.getSetID()), memberCapID);
        logDebug("Add set result: " + addResult.getSuccess());
    }
    catch (err) {
        logDebug("Exception in addCapSetMember:" + err.message);
    }
}

function updateSetStatusX(setName, setDescription, setType, comment, setStatus, setStatusComment) {
    try {
        var setTest = new capSet(setName, setDescription);
        setTest.status = setStatus;  // update the set header status
        setTest.comment = comment;   // changed the set comment
        setTest.statusComment = setStatusComment; // change the set status comment
        setTest.type = setType;
        setTest.update();  // commit changes to the set
    }
    catch (err) {
        logDebug("Exception in updateSetStatus:" + err.message);
    }
}

// Generate Report.
/*function GenerateReport(itemCapId, altID) {
var reportFileName = null;
aa.print("Reportname: " + reportName);
var repService = new ReportHelper(servProvCode, reportName);
repService.ReportUser = currentUser == null ? "ADMIN" : currentUser.getUserID().toString()
repService.CapID = itemCapId;
repService.altID = altID;
repService.isEDMS = true;
if (repService.ExecuteReport()) {
reportFileName = repService.ReportFileName;
}
return reportFileName;
}*/

function generateReport(itemCapId) {
    var isSuccess = false;
    try {
        var parameters = aa.util.newHashMap();
        parameters.put("PARENT", itemCapId.getCustomID());

        var report = aa.reportManager.getReportInfoModelByName(reportName);
        report = report.getOutput();
        //aa.print(report);
        report.setCapId(itemCapId.toString());
        report.setModule("Licenses");
        report.setReportParameters(parameters);
        // set the alt-id as that's what the EDMS is using.
        report.getEDMSEntityIdModel().setAltId(itemCapId.getCustomID());
        var checkPermission = aa.reportManager.hasPermission(reportName, "admin");
        logDebug("Permission for report: " + checkPermission.getOutput().booleanValue());

        if (checkPermission.getOutput().booleanValue()) {
            logDebug("User has permission");
            var reportResult = aa.reportManager.getReportResult(report);
            if (reportResult) {
                isSuccess = true;
            }
            // not needed as the report is set up for EDMS
            if (false) {
                reportResult = reportResult.getOutput();
                logDebug("Report result: " + reportResult);
                reportFile = aa.reportManager.storeReportToDisk(reportResult);
                reportFile = reportFile.getOutput();
                logDebug("Report File: " + reportFile);
            }
        }
    }
    catch (vError) {
        logDebug("Runtime error occurred: " + vError);
    }
    return isSuccess;
}

function GenerateMissingReportForSets(pSetName) {
    var isValid = true;
    var isReportGenerated = false;

    var sql = "SELECT sd.set_id, sd.b1_per_id1, sd.b1_per_id2, sd.b1_per_id3 ";
    sql += " FROM setdetails sd ";
    sql += " WHERE sd.serv_prov_code = '" + servProvCode + "' ";
    sql += " AND sd.set_id = '" + pSetName + "' ";
    sql += " AND sd.rec_status = 'A' ";
    sql += " AND NOT EXISTS (SELECT 1 FROM bdocument bd ";
    sql += " WHERE bd.serv_prov_code = sd.serv_prov_code ";
    sql += " AND bd.b1_per_id1 = sd.b1_per_id1 ";
    sql += " AND bd.b1_per_id2 = sd.b1_per_id2 ";
    sql += " AND bd.b1_per_id3 = sd.b1_per_id3 ";
    sql += " AND doc_status = 'Uploaded' ";
    //sql += " AND trunc(bd.File_upload_date) = trunc(sysdate) ";
    sql += " AND bd.source_name = 'DOCUMENTUM' ";
    sql += " AND bd.ent_type = 'CAP' ";
    sql += " AND bd.rec_status = 'A') ";

    logDebug(sql);
    var vError = '';
    var conn = null;
    var sStmt = null;
    var rSet = null;
    try {
        var initialContext = aa.proxyInvoker.newInstance("javax.naming.InitialContext", null).getOutput();
        var ds = initialContext.lookup("java:/AA");
        conn = ds.getConnection();

        sStmt = conn.prepareStatement(sql);
        rSet = sStmt.executeQuery();
        while (rSet.next()) {
            var itemCapId = aa.cap.getCapID(rSet.getString("B1_PER_ID1"), rSet.getString("B1_PER_ID2"), rSet.getString("B1_PER_ID3")).getOutput();
            logDebug(itemCapId);
            //var itemCap = aa.cap.getCap(itemCapId).getOutput();
            var isSuccess = generateReport(itemCapId);
        }
    } catch (vError) {
        logDebug("Runtime error occurred: " + vError);
    }
    closeDBQueryObject(rSet, sStmt, conn);

    return isReportGenerated;
}
