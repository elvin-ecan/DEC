/*------------------------------------------------------------------------------------------------------/
| Program:  BATCH_LT_FULLFILLMENT_BDAY.js  Trigger: Batch
| Event   : N/A
| Usage   : Batch job (Daily)
| Agency  : DEC
| Purpose : Batch to create tags for Lifetime fullfillment.
| Notes   : 10/15/2013     Laxmikant Bondre (LBONDRE),     Initial Version 
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| START: TEST PARAMETERS
/------------------------------------------------------------------------------------------------------*/
//aa.env.setValue("emailAddress", "");
//aa.env.setValue("LookAheadDays", 21);
//aa.env.setValue("showDebug", "Y");
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
eval(getScriptText("INCLUDES_BATCH"));
eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS"));
eval(getScriptText("INCLUDES_CUSTOM"));
eval(getScriptText("INCLUDES_REBUILD_TAGS"));

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
var vLookAheadDays = getParam("LookAheadDays");     // LookAhead Days From Report Manager
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
var vToday = startDate;
vToday.setHours(0);
vToday.setMinutes(0);
vToday.setSeconds(0);
var isPartialSuccess = false;
var timeExpired = false;
var sysDate = aa.date.getCurrentDate();
var sysDateMMDDYYYY = dateFormatted(sysDate.getMonth(), sysDate.getDayOfMonth(), sysDate.getYear(), "");
var currentUser = aa.person.getCurrentUser().getOutput();
var currentUserID = currentUser == null ? "ADMIN" : currentUser.getUserID().toString()
var capId = null;
var debug;
var vEffDate;
var fvRunProcess = "LIFETIME_LASTRUNDATE_BDAY";

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

function mainProcess() {
    var fvError = null;
    try {
        var fvSuccess = checkBatch();
        if (!fvSuccess) return false;

        logDebug("****** Start logic ******");

        var fvRefs = getAllRefsToProcess();
        var fvErrors = runProcessRecords(fvRefs);
        if (fvErrors) {
            showErrors(fvErrors);
            return false;
        }
        updateLastRunDate();

        logDebug("****** End logic ******");

        return true;
    }
    catch (fvError) {
        logDebug("Runtime error occurred: " + fvError);
        return false;
    }  
}

function checkBatch() {
    var fvBatchJobResult = aa.batchJob.getJobID();
    batchJobName = "" + aa.env.getValue("BatchJobName");

    if (fvBatchJobResult.getSuccess()) {
        batchJobID = fvBatchJobResult.getOutput();
        logDebug("Batch job ID found " + batchJobID);
        return true;
    }
    else {
        logDebug("Batch job ID not found " + fvBatchJobResult.getErrorMessage());
        return false;
    }
}

function getAllRefsToProcess() {
    var opRefContacts = aa.util.newHashMap();
    var fvLastRunDate = getLastRunDate();
    var fvRunDate = getRunDates(fvLastRunDate);

    fvStartDate = fvRunDate.StartDate;
    fvEndDate = fvRunDate.EndDate;
    vEffDate = fvEndDate;
    fvStartYear = fvRunDate.StartYear;
    fvEndYear = fvRunDate.EndYear;

    for (var fvYearCounter = fvStartYear; fvYearCounter <= fvEndYear; fvYearCounter++) {
        var fvProcDtStart = new Date(fvYearCounter, fvStartDate.getMonth(), fvStartDate.getDate());
        var fvProcDtEnd = new Date(fvYearCounter, fvEndDate.getMonth(), fvEndDate.getDate());
        if (fvProcDtStart.getTime() > fvProcDtEnd.getTime())
            fvProcDtEnd = new Date(fvYearCounter + 1, fvEndDate.getMonth(), fvEndDate.getDate());
        opRefContacts = getRefContactsByRecTypeByStatusByDOB("Licenses","Lifetime",null,null,"Active",fvProcDtStart,fvProcDtEnd,opRefContacts);
    }
    opRefContacts = processNewAdded(convertDate(dateAdd(fvLastRunDate,1)),convertDate(dateAdd(fvStartDate,-1)),fvStartYear,fvEndYear,opRefContacts);
    return opRefContacts;
}

function getLastRunDate() {
   return new Date(lookup("DEC_CONFIG", fvRunProcess).toString());
}

function getRunDates(ipLastRunDate) {
    var opRunDate = new Array();
    opRunDate["StartDate"] = convertDate(dateAdd(ipLastRunDate, vLookAheadDays + 1));
    opRunDate["EndDate"] = convertDate(dateAdd(vToday, vLookAheadDays));
    opRunDate["StartYear"] = convertDate(opRunDate["StartDate"]).getFullYear() - 16;
    opRunDate["EndYear"] = convertDate(opRunDate["EndDate"]).getFullYear() - 12;
    return opRunDate;
}

/* FUNCTION TO GET ALL REF CONTACTS FOR A RECORD TYPE, FOR A STATUS WITH A BIRTHDATE.*/
function getRefContactsByRecTypeByStatusByDOB(ipGroup,ipType,ipSubType,ipCategory,ipStatus,ipBDate,ipEndBDate,ipRefContacts) {
    var fvFind = false;
    var fvEmptyCm = aa.cap.getCapModel().getOutput();
    if ((ipGroup != null && ipGroup != "") ||
        (ipType != null && ipType != "") ||
        (ipSubType != null && ipSubType != "") ||
        (ipCategory != null && ipCategory != "")) {
        var fvEmptyCt = fvEmptyCm.getCapType();
        if (ipGroup != null && ipGroup != "")
            fvEmptyCt.setGroup(ipGroup);
        if (ipType != null && ipType != "")
            fvEmptyCt.setType(ipType);
        if (ipSubType != null && ipSubType != "")
            fvEmptyCt.setSubType(ipSubType);
        if (ipCategory != null && ipCategory != "")
            fvEmptyCt.setCategory(ipCategory);
        fvEmptyCm.setCapType(fvEmptyCt);
        fvFind = true;
    }

    if (ipStatus != null && ipStatus != "") {
        fvEmptyCm.setCapStatus(ipStatus);
        fvFind = true;
    }

    var fvFileDate = null;
    if (arguments.length > 8)
        fvFileDate = arguments[8];
    if (fvFileDate != null) {
        fvEmptyCm.setFileDate(fvFileDate);
        fvFind = true;
    }
    var fvEndFileDate = null;
    if (arguments.length > 9)
        fvEndFileDate = arguments[9];
    if (fvEndFileDate != null) {
        fvEmptyCm.setEndFileDate(fvEndFileDate);
        fvFind = true;
    }

    if ((ipBDate != null && ipBDate != "") ||
        (ipEndBDate != null && ipEndBDate != "")) {
        var fvEmptyCcm = fvEmptyCm.getCapContactModel();
        var fvEmptyPpl = fvEmptyCcm.getPeople();
        if (ipBDate != null && ipBDate != "") {
            fvEmptyCcm.setBirthDate(ipBDate);
            fvEmptyPpl.setBirthDate(ipBDate);
        }
        if (ipEndBDate != null && ipEndBDate != "") {
            fvEmptyCcm.setEndBirthDate(ipEndBDate);
            fvEmptyPpl.setEndBirthDate(ipEndBDate);
        }
        fvEmptyCcm.setPeople(fvEmptyPpl);
        fvEmptyCcm.setContactType("Individual");
        fvEmptyCm.setCapContactModel(fvEmptyCcm);
        fvFind = true;
    }
    if (!fvFind)
        return false;
    var fvResult = aa.cap.getCapIDListByCapModel(fvEmptyCm);
    if (fvResult) {
        var fvCaps = fvResult.getOutput();
        if (fvCaps) {
            opRefContacts = ipRefContacts;
            for (var fvCount1 in fvCaps) {
                if (elapsed() > maxSeconds) // only continue if time hasn't expired
                {
                    isPartialSuccess = true;
                    showDebug = true;
                    logDebug("A script timeout has caused partial completion of this process.  Please re-run.  " + elapsed() + " seconds elapsed, " + maxSeconds + " allowed.");
                    timeExpired = true;
                    break;
                }
                var fvCap = fvCaps[fvCount1];
                var fvCapQry = aa.cap.getCapID(fvCap.ID1,fvCap.ID2,fvCap.ID3);
                if (fvCapQry.getSuccess()) {
                    var fvCapID = fvCapQry.getOutput();
                    var fvContactQry = aa.people.getCapContactByCapID(fvCapID);
                    if (fvContactQry.getSuccess()) {
                        var fvContacts = fvContactQry.getOutput();
                        for (var fvCount2 in fvContacts) {
                            if (elapsed() > maxSeconds) // only continue if time hasn't expired
                            {
                                isPartialSuccess = true;
                                showDebug = true;
                                logDebug("A script timeout has caused partial completion of this process.  Please re-run.  " + elapsed() + " seconds elapsed, " + maxSeconds + " allowed.");
                                timeExpired = true;
                                break;
                            }
                            var fvContact = fvContacts[fvCount2].getCapContactModel();
                            if (fvFileDate != null && fvEndFileDate != null) {
                                var fvContinue = shouldContinue(fvContact,fvFileDate,fvEndFileDate);
                                if (fvContinue)
                                    continue;
                            }
                            if (!opRefContacts.containsKey(fvContact.refContactNumber))
                                opRefContacts.put(fvContact.refContactNumber,fvContact.refContactNumber);
                        }
                    }
                }
            }
            return opRefContacts;
        }
    }
    return false;
}

function shoudContinue(ipContact,ipStartDate,ipEndDate) {
    var fvBirthDate = ipContact.getBirthDate();
    var fvBDStr = fvBirthDate.getMonth().toString() + "/" + fvBirthDate.getDate().toString() + "/" + ipStartDate.getFullYear().toString();
    fvBirthDate = new Date(fvBDStr);
    if (fvBirthDate.getTime() > ipEndDate.getTime())
        return true;
    if (fvBirthDate.getTime() < ipStartDate.getTime()) {
        var fvBDStr = fvBirthDate.getMonth().toString() + "/" + fvBirthDate.getDate().toString() + "/" + ipEndDate.getFullYear().toString();
        fvBirthDate = new Date(fvBDStr);
        if (fvBirthDate.getTime() > ipEndDate.getTime())
            return true;
    }
    return false;
}

function processNewAdded(ipStartDt,ipEndDt,ipStartYear,ipEndYear,ipRefContacts) {
    var opRefContacts = ipRefContacts;
    for (var fvYearCounter = ipStartYear; fvYearCounter <= ipEndYear; fvYearCounter++) {
        var fvProcDtStart = new Date(fvYearCounter, ipStartDt.getMonth(), ipStartDt.getDate());
        var fvProcDtEnd = new Date(fvYearCounter, ipEndDt.getMonth(), ipEndDt.getDate());
        if (fvProcDtStart.getTime() > fvProcDtEnd.getTime())
            fvProcDtEnd = new Date(fvYearCounter + 1, ipEndDt.getMonth(), ipEndDt.getDate());
        opRefContacts = getRefContactsByRecTypeByStatusByDOB("Licenses","Lifetime",null,null,"Active",fvProcDtStart,fvProcDtEnd,opRefContacts,fvProcDtStart,fvProcDtEnd);
    }
    return opRefContacts;
}

function runProcessRecords(ipRefs) {
    var opErrors = null;
    if (ipRefs) {
        fvRefContacts = ipRefs.keySet().toArray();
        if (fvRefContacts.length == 0) {
           opErrors = new Array();
           opErrors.push("No Reference Contacts to be processed.");
        }
        else {
            for (var fvCounter in fvRefContacts) {
                if (elapsed() > maxSeconds) // only continue if time hasn't expired
                {
                    isPartialSuccess = true;
                    showDebug = true;
                    logDebug("A script timeout has caused partial completion of this process.  Please re-run.  " + elapsed() + " seconds elapsed, " + maxSeconds + " allowed.");
                    timeExpired = true;
                    break;
                }
                var fvRefContact = fvRefContacts[fvCounter];
                var fvError = rebuildRefTags(fvRefContact);
                if (fvError) {
                    if (!opErrors)
                        opErrors = new Array();
                    opErrors.push(fvError);
                }
            }
        }
    }
    else {
        opErrors = new Array();
        opErrors.push("No Reference Contacts to be processed.");
    }
    return opErrors;
}

function rebuildRefTags(ipRefContact) {
    var opErrors = rebuildAllTagsforaRefContact(ipRefContact,vEffDate);
    return opErrors;
}

function showErrors(ipErrors) {
    for (var fvCount in ipErrors) {
        var fvError = ipErrors[fvCount];
        logDebug(fvError);
    }
}

function updateLastRunDate() {
    editLookup("DEC_CONFIG", fvRunProcess,(new Datte()).toString());
}
