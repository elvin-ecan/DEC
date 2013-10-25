/*------------------------------------------------------------------------------------------------------/
| Program : INCLUDES_DEC_APP_OBJECT.js
| Event   : N/A
|
| Usage   : Custom Script Include.  Insert custom EMSE Function below and they will be available 
|           to all master scripts through 
|            1. INCLUDES_CUSTOM 
|            or 2. Expression scripts fles (Starts with EXPR)
|            or 3. in expression 
|
| Notes   : 01/02/2013,     Lalit S Gawad (LGAWAD),     Initial Version 
|         
/------------------------------------------------------------------------------------------------------*/
var GS2_SCRIPT = "SCRIPT";
var GS2_BATCH = "BATCH";
var GS2_EXPR = "EMSE";
var gCaller = GS2_EXPR; //default

var OPTZ_TYPE_ALLFEES = 1; //Optimizer pass from caller to get fee information in engne rule;
var OPTZ_TYPE_SELECTED_FEES = 2; //Optimizer pass from caller to get fee information for selected information in engne rule;
var OPTZ_TYPE_CTRC = 3; //Optimizer pass from caller to avod unnecessary processing in engne rule

var allTableNames = new Array();
var allTableRefLink = new Array();

allTableNames[allTableNames.length] = new Array("License Year", "SWIS Code", "Tax Map ID/Parcel ID", "Check this box to use this landowner parcel for your DMP application", "Last Date");
allTableRefLink["LANDOWNERINFORMATION"] = allTableNames.length - 1;
allTableNames[allTableNames.length] = new Array("Year", "Annual Disability Case Number", "40%+ Military Disabled", "Last Date");
allTableRefLink["ANNUALDISABILITY"] = allTableNames.length - 1;
allTableNames[allTableNames.length] = new Array("Sportsman Education Type", "Certificate Number", "Certification Date", "State", "Country", "Other Country", "Last Date", "Revoked");
allTableRefLink["SPORTSMANEDUCATION"] = allTableNames.length - 1;
allTableNames[allTableNames.length] = new Array("Previous License Type", "License Date", "License Number", "State", "Country", "Other Country", "Verified_By", "Last Date");
allTableRefLink["PREVIOUSLICENSE"] = allTableNames.length - 1;
allTableNames[allTableNames.length] = new Array("Item Code", "Description", "Tag / Document ID", "From Date", "To Date", "License Year", "Tag", "RecordType");
allTableRefLink["ACTIVEHOLDINGS"] = allTableNames.length - 1;
function TestScript() {
    var f = new form_OBJECT(GS2_SCRIPT);
    f.Year = "2013";
    f.ExecuteBoRuleEngine();

    //alert("ddddd");
}
/***versions Object**********/
function VERSIONS(identity) {
    this.Identity = identity; //2011,2012 etc.

    this.dmVersion = GetVersionMap();

    this.GetVersion = function (year) {
        if (year == 'OTHERSALE') {
            currentVersion = this.dmVersion.Lookup(year.toString());
        }
        else {
            var intyear = parseInt(year, 10);

            while (true) {
                currentVersion = this.dmVersion.Lookup(intyear.toString());
                if (typeof currentVersion != "undefined" && currentVersion != null) {
                    break;
                }
                intyear--;
                if (intyear < 2005) {
                    break;
                }
            }
        }
        return currentVersion;
    }
    this.GetVersionItems = function (year) {
        //Swich Date is beween
        var syear = differBySwitch(year);
        return this.GetVersion(syear);
    }
}
/***Application Object**********/
function form_OBJECT(identity) {
    this.optmzType = 0;
    if (arguments.length > 1) {
        this.optmzType = arguments[1];
    }

    gCaller = identity;

    this.Identity = identity; //EMSE, SCRIPT, BATCH 
    this.EB = null;
    this.FromACA = null;
    this.UserIdEB = null;
    this.isPublicUser = false;
    this.isCallcenter = false;
    this.isCampsite = false;
    this.isMunicipality = false;
    this.isNYSDEC_HQ = false;
    this.isNYSDEC_Regional_Office = false;
    this.isNative_American_Agency = false;
    this.isRetail = false;

    this.RecordType = "";
    this.Year = "";
    this.versions = new VERSIONS();
    this.VersionItems = new Array();   //Array of Prop Bag

    //Contact Information
    this.FirstName = "";
    this.MiddleName = "";
    this.LastName = "";
    this.FullName = "";

    this.DOB = new Date();
    this.Gender = "";

    this.Country = "";
    this.AddressLine1 = "";
    this.AddressLine2 = "";
    this.City = "";
    this.State = "";
    this.Zip = "";

    this.DayTimePhone = "";
    this.WorkPhone = "";
    this.MobilePhone = "";
    this.Fax = "";
    this.Email = "";

    this.IsNyResiDent = "";
    this.IsMinor = "";
    this.IsLegallyBlind = "";
    this.IsPermanentDisabled = "";
    this.IsNativeAmerican = "";
    this.PreferencePoints = new Number();
    this.PreferencePoints = 0;

    //MILITARY ACTIVE SERVICE STATUS
    this.IsMilitaryServiceman = "";

    //APPEARANCE
    this.Height = "";
    this.EyeColor = "";

    //ANNUAL DISABILITY
    this.AnnualDisablity = new Array();
    this.AddAnnualDisability = function (sYear, sAnnualDisabilityCaseNumber, sFourtyPrcentMilitaryDisabled, sLastDate) {
        var oDisability = new ANNUAL_DISABILITY();
        oDisability.Year = isNull(sYear, '');
        oDisability.AnnualDisabilityCaseNumber = isNull(sAnnualDisabilityCaseNumber, '');
        oDisability.FourtyPrcentMilitaryDisabled = isNull(sFourtyPrcentMilitaryDisabled, '');
        oDisability.LastDate = isNull(sLastDate, '');

        this.AnnualDisablity[this.AnnualDisablity.length] = oDisability;
    }
    this.ValidateAnnualDisability = function () {
        var valid = true
        //PLACE Holder to Validate Array 
        //this.AnnualDisablity

        return valid;
    }
    this.ClearAnnualDisability = function () {
        this.AnnualDisablity.length = 0;
    }
    this.SetAnnualDisability = function (annualDisabilitySTR) {
        this.ClearAnnualDisability();
        var tmp = String(annualDisabilitySTR);
        if (tmp && tmp != "") {
            var rows = tmp.split("|");
            for (var idx = 0; idx < rows.length; idx++) {
                var arr = rows[idx].split('^');
                this.AddAnnualDisability(arr[0], arr[1], arr[2], arr[3]);
            }
        }
    }
    this.GetAnnualDisabilityStr = function () {
        var rowStr = new Array();
        for (var idx = 0; idx < this.AnnualDisablity.length; idx++) {
            var temp = new Array();
            temp[temp.length] = this.AnnualDisablity[idx].Year
            temp[temp.length] = this.AnnualDisablity[idx].AnnualDisabilityCaseNumber;
            temp[temp.length] = this.AnnualDisablity[idx].FourtyPrcentMilitaryDisabled;
            temp[temp.length] = this.AnnualDisablity[idx].LastDate;

            rowStr[rowStr.length] = temp.join('^');
        }
        return ((rowStr.length > 0) ? rowStr.join('|') : '');
    }
    this.IsDisableForYear = function (year) {
        var retisDisableForYear = false;
        for (var idx = 0; idx < this.AnnualDisablity.length; idx++) {
            if (this.AnnualDisablity[idx].Year + "" == year + "") {
                retisDisableForYear = ((this.AnnualDisablity[idx].FourtyPrcentMilitaryDisabled + "").toLowerCase() == "yes");
                if (retisDisableForYear) {
                    break;
                }
            }
        }
        return retisDisableForYear;
    }

    //LAND OWNER INFORMATION
    this.LandOwnerInfo = new Array();
    this.AddLandOwnerInfo = function (sLicenseYear, sSWISCode, sTaxMapID_ParcelID, sIsDmpUse, sLastDate) {
        var oLandOwnerInfo = new LAND_OWNER_INFORMATION();
        oLandOwnerInfo.LicenseYear = isNull(sLicenseYear, '');
        oLandOwnerInfo.SWISCode = isNull(sSWISCode, '');
        oLandOwnerInfo.TaxMapID_ParcelID = isNull(sTaxMapID_ParcelID, '');
        oLandOwnerInfo.IsDmpUse = isNull(sIsDmpUse, '');
        oLandOwnerInfo.LastDate = isNull(sLastDate, '');

        this.LandOwnerInfo[this.LandOwnerInfo.length] = oLandOwnerInfo;
    }
    this.ValidateLandOwnerInfo = function () {
        var valid = true
        //PLACE Holder to Validate Array 
        //this.LandOwnerInfo

        return valid;
    }
    this.ClearLandOwnerInfo = function () {
        this.LandOwnerInfo.length = 0;
    }
    this.SetLandOwnerInfo = function (landOwnerInfoSTR) {
        this.ClearLandOwnerInfo();
        var tmp = String(landOwnerInfoSTR);
        if (tmp && tmp != "") {
            var rows = tmp.split("|");
            for (var idx = 0; idx < rows.length; idx++) {
                var arr = rows[idx].split('^');
                this.AddLandOwnerInfo(arr[0], arr[1], arr[2], arr[3], arr[4]);
            }
        }
    }
    this.GetLandOwnerInfoStr = function () {
        var rowStr = new Array();
        for (var idx = 0; idx < this.LandOwnerInfo.length; idx++) {
            var temp = new Array();
            temp[temp.length] = this.LandOwnerInfo[idx].LicenseYear
            temp[temp.length] = this.LandOwnerInfo[idx].SWISCode;
            temp[temp.length] = this.LandOwnerInfo[idx].TaxMapID_ParcelID;
            temp[temp.length] = this.LandOwnerInfo[idx].IsDmpUse;
            temp[temp.length] = this.LandOwnerInfo[idx].LastDate;

            rowStr[rowStr.length] = temp.join('^');
        }
        return ((rowStr.length > 0) ? rowStr.join('|') : '');
    }

    //PREVIOUS LICENSE
    this.PriorLicense = new Array();
    this.AddPriorLicense = function (sPreviousLicenseType, dtLicenseDate, sLicenseNumber, sState, sCountry, sOtherCountry, sVerified_By, sLastDate) {
        var oPriorLicense = new PREVIOUS_LICENSE();
        oPriorLicense.PreviousLicenseType = isNull(sPreviousLicenseType, '');
        oPriorLicense.LicenseDate = isNull(dtLicenseDate, '');
        oPriorLicense.LicenseNumber = isNull(sLicenseNumber, '');
        oPriorLicense.State = isNull(sState, '');
        oPriorLicense.Country = isNull(sCountry, '');
        oPriorLicense.OtherCountry = isNull(sOtherCountry, '');
        oPriorLicense.Verified_By = isNull(sVerified_By, '');
        oPriorLicense.LastDate = isNull(sLastDate, '');

        this.PriorLicense[this.PriorLicense.length] = oPriorLicense;
    }
    this.ValidatePriorLicense = function () {
        var valid = true
        //PLACE Holder to Validate Array 
        //this.PriorLicense

        return valid;
    }
    this.ClearPriorLicense = function () {
        this.PriorLicense.length = 0;
    }
    this.SetPriorLicense = function (priorLicenseSTR) {
        this.ClearPriorLicense();
        var tmp = String(priorLicenseSTR);
        if (tmp && tmp != "") {
            var rows = tmp.split("|");
            for (var idx = 0; idx < rows.length; idx++) {
                var arr = rows[idx].split('^');
                this.AddPriorLicense(arr[0], arr[1], arr[2], arr[3], arr[4], arr[5], arr[6], arr[7]);
            }
        }
    }
    this.GetPriorLicenseStr = function () {
        var rowStr = new Array();
        for (var idx = 0; idx < this.PriorLicense.length; idx++) {
            var temp = new Array();
            temp[temp.length] = this.PriorLicense[idx].PreviousLicenseType
            temp[temp.length] = this.PriorLicense[idx].LicenseDate;
            temp[temp.length] = this.PriorLicense[idx].LicenseNumber;
            temp[temp.length] = this.PriorLicense[idx].State;
            temp[temp.length] = this.PriorLicense[idx].Country;
            temp[temp.length] = this.PriorLicense[idx].OtherCountry;
            temp[temp.length] = this.PriorLicense[idx].Verified_By;
            temp[temp.length] = this.PriorLicense[idx].LastDate;
            temp[temp.length] = this.PriorLicense[idx].Revoked;

            rowStr[rowStr.length] = temp.join('^');
        }
        return ((rowStr.length > 0) ? rowStr.join('|') : '');
    }
    //SPORTSMAN EDUCATION
    this.SportsmanEducation = new Array();
    this.AddSportsmanEducation = function (sEducationType, sCertificateNumber, sCertificateDate, sState, sCountry, sOtherCountry, sLastDate, sRevoked) {
        var oSportsmanEducation = new SPORTSMAN_EDUCTION();
        oSportsmanEducation.EducationType = isNull(sEducationType, '');
        oSportsmanEducation.CertificateDate = isNull(sCertificateDate, '');
        oSportsmanEducation.CertificateNumber = isNull(sCertificateNumber, '');
        oSportsmanEducation.State = isNull(sState, '');
        oSportsmanEducation.Country = isNull(sCountry, '');
        oSportsmanEducation.OtherCountry = isNull(sOtherCountry, '');
        oSportsmanEducation.LastDate = isNull(sLastDate, '');
        oSportsmanEducation.Revoked = isNull(sRevoked, '');

        this.SportsmanEducation.push(oSportsmanEducation);
    }
    this.ValidateSportsmanEducation = function () {
        var valid = true
        //PLACE Holder to Validate Array 
        //this.SportsmanEducation

        return valid;
    }

    this.ClearSportsmanEducation = function () {
        this.SportsmanEducation.length = 0;
    }

    this.SetSportsmanEducation = function (SportsmanEducationSTR) {
        this.ClearSportsmanEducation();
        var tmp = String(SportsmanEducationSTR);
        if (tmp && tmp != "") {
            var rows = tmp.split("|");
            for (var idx = 0; idx < rows.length; idx++) {
                var arr = rows[idx].split('^');
                this.AddSportsmanEducation(arr[0], arr[1], arr[2], arr[3], arr[4], arr[5], arr[6], arr[7]);
            }
        }
    }

    this.GetSportsmanEducationStr = function () {
        var rowStr = new Array();
        for (var idx = 0; idx < this.SportsmanEducation.length; idx++) {
            var temp = new Array();
            temp[temp.length] = this.SportsmanEducation[idx].EducationType
            temp[temp.length] = this.SportsmanEducation[idx].CertificateNumber;
            temp[temp.length] = this.SportsmanEducation[idx].CertificateDate;
            temp[temp.length] = this.SportsmanEducation[idx].State;
            temp[temp.length] = this.SportsmanEducation[idx].Country;
            temp[temp.length] = this.SportsmanEducation[idx].OtherCountry;
            temp[temp.length] = this.SportsmanEducation[idx].LastDate;

            rowStr[rowStr.length] = temp.join('^');
        }
        return ((rowStr.length > 0) ? rowStr.join('|') : '');
    }

    //ACTIVEHOLDINGS
    this.ActiveHoldingsInfo = new Array();
    this.AddActiveHoldingsInfo = function (sItemCode, sDescription, sTag_or_DocumentID, sFromDate, sToDate, sLicenseYear, sTag, sRecordType) {
        var oActiveHoldingsInfo = new ACTVE_HOLDINGS();
        oActiveHoldingsInfo.ItemCode = sItemCode;
        oActiveHoldingsInfo.Description = sDescription;
        oActiveHoldingsInfo.Tag_or_DocumentID = sTag_or_DocumentID;
        oActiveHoldingsInfo.FromDate = sFromDate;
        oActiveHoldingsInfo.ToDate = sToDate;
        oActiveHoldingsInfo.LicenseYear = sLicenseYear;
        oActiveHoldingsInfo.Tag = sTag;
        oActiveHoldingsInfo.RecordType = sRecordType;

        this.ActiveHoldingsInfo[this.ActiveHoldingsInfo.length] = oActiveHoldingsInfo;
    }
    this.ValidateActiveHoldingsInfo = function () {
        var valid = true
        //PLACE Holder to Validate Array 
        //this.ActiveHoldingsInfo

        return valid;
    }
    this.ClearActiveHoldingsInfo = function () {
        this.ActiveHoldingsInfo.length = 0;
    }
    this.SetActiveHoldingsInfo = function (ActiveHoldingsInfoSTR) {
        this.ClearActiveHoldingsInfo();
        var tmp = String(ActiveHoldingsInfoSTR);
        if (tmp && tmp != "") {
            var rows = tmp.split("|");
            for (var idx = 0; idx < rows.length; idx++) {
                var arr = rows[idx].split('^');
                this.AddActiveHoldingsInfo(arr[0], arr[1], arr[2], arr[3], arr[4], arr[5], arr[6], arr[7]);
            }
        }
    }
    this.GetActiveHoldingsInfoStr = function () {
        var rowStr = new Array();
        for (var idx = 0; idx < this.ActiveHoldingsInfo.length; idx++) {
            var temp = new Array();
            temp[temp.length] = this.ActiveHoldingsInfo[idx].ItemCode;
            temp[temp.length] = this.ActiveHoldingsInfo[idx].Description;
            temp[temp.length] = this.ActiveHoldingsInfo[idx].Tag_or_DocumentID;
            temp[temp.length] = this.ActiveHoldingsInfo[idx].FromDate;
            temp[temp.length] = this.ActiveHoldingsInfo[idx].ToDate;
            temp[temp.length] = this.ActiveHoldingsInfo[idx].LicenseYear;
            temp[temp.length] = this.ActiveHoldingsInfo[idx].Tag;
            temp[temp.length] = this.ActiveHoldingsInfo[idx].RecordType;

            rowStr[rowStr.length] = temp.join('^');
        }
        return ((rowStr.length > 0) ? rowStr.join('|') : '');
    }
    this.RemoveActiveHoldingsbyDocId = function (docid) {
        var rowPionter = -1;
        for (var idx = 0; idx < this.ActiveHoldingsInfo.length; idx++) {
            if (docid == this.ActiveHoldingsInfo[idx].Tag_or_DocumentID) {
                rowPionter = idx;
                break;
            }
        }
        if (rowPionter > -1) {
            for (var idx = rowPionter; idx < this.ActiveHoldingsInfo.length - 1; idx++) {
                this.ActiveHoldingsInfo[idx] = this.ActiveHoldingsInfo[idx + 1];
            }

            this.ActiveHoldingsInfo.length = (this.ActiveHoldingsInfo.length - 1)
        }
    }

    this.HasHuntEd = function () {
        var retValue = false;
        var idx;
        for (idx = 0; idx < this.SportsmanEducation.length; idx++) {
            if (IsHuntEd(this.SportsmanEducation[idx].EducationType)) {
                retValue = true;
                break;
            }
        }
        if (!retValue) {
            for (idx = 0; idx < this.PriorLicense.length; idx++) {
                if (IsHuntEd(this.PriorLicense[idx].PreviousLicenseType)) {
                    retValue = true;
                    break;
                }
            }
        }
        return retValue;
    }
    this.HasBowHunt = function () {
        var retValue = false;
        var idx;
        for (idx = 0; idx < this.SportsmanEducation.length; idx++) {
            if (IsBowHunt(this.SportsmanEducation[idx].EducationType)) {
                retValue = true;
                break;
            }
        }
        if (!retValue) {
            for (idx = 0; idx < this.PriorLicense.length; idx++) {
                if (IsBowHunt(this.PriorLicense[idx].PreviousLicenseType)) {
                    retValue = true;
                    break;
                }
            }
        }
        return retValue;
    }
    this.HasTrapEd = function () {
        var retValue = false;
        var idx;
        for (idx = 0; idx < this.SportsmanEducation.length; idx++) {
            if (IsTrapEd(this.SportsmanEducation[idx].EducationType)) {
                retValue = true;
                break;
            }
        }
        if (!retValue) {
            for (idx = 0; idx < this.PriorLicense.length; idx++) {
                if (IsTrapEd(this.PriorLicense[idx].PreviousLicenseType)) {
                    retValue = true;
                    break;
                }
            }
        }
        return retValue;
    }
    this.HasNYSSportEd = function () {
        var retValue = false;
        for (var idx = 0; idx < this.SportsmanEducation.length; idx++) {
            if (this.SportsmanEducation[idx].State == 'NY') {
                retValue = true;
                break;
            }
        }
        return retValue;
    }
    this.SetEnforcementAttrib = function (sSuspended, sRevokedHunting, sRevokedTrapping, sRevokedFishing) {
        this.Suspended = ((sSuspended + "").toLowerCase() == "yes");
        this.Revoked_Hunting = ((sRevokedHunting + "").toLowerCase() == "yes");
        this.Revoked_Trapping = ((sRevokedTrapping + "").toLowerCase() == "yes");
        this.Revoked_Fishing = ((sRevokedFishing + "").toLowerCase() == "yes");
    }
    this.SetFulfillmentAttrib = function (sAgedIn, sNeedHuntEd) {
        this.AgedIn = ((sAgedIn + "").toLowerCase() == "yes");
        this.NeedHuntEd = ((sNeedHuntEd + "").toLowerCase() == "yes");
    }

    this.CountHunterGroup = new Number(0);
    this.ContactMsgLink_Hunt = "";
    this.MessageHunter = "";
    this.CountFishGroup = new Number(0);
    this.ContactMsgLink_Fish = "";
    this.MessageFish = "";
    this.CountLifeTimeGroup = new Number(0);
    this.MessageLifeTime = "";
    this.ContactMsgLink_Lifetime = "";
    this.CountOtherSaleGroup = new Number(0);
    this.MessageOtherSale = "";
    this.Quantity_Trail_Supporter_Patch = "1";
    this.Quantity_Venison_Donation = "1";
    this.Quantity_Conservation_Patron = "1";
    this.Quantity_Conservation_Fund = "1";
    this.Quantity_Conservationist_Magazine = "1";
    this.Quantity_Habitat_Stamp = "1";
    this.Inscription = "";
    this.Suspended = false;
    this.Revoked_Hunting = false;
    this.Revoked_Trapping = false;
    this.Revoked_Fishing = false;
    this.currDrawType = '';
    this.AgedIn = false;
    this.NeedHuntEd = false;
    this.EitherOrAntler = 2; //1:None; 6=2|4:E; 14=2|4|8:A;
    this.HasBowPriv = false;
    this.HasMuzzPriv = false;

    //LICENSES Sale Items
    this.licObjARRAY = new Array();
    this.licensesNameArray = new Array(); 	// Holds references

    this.Clearlicenses = function (contactFieldName, asiFieldName) {
        this.licObjARRAY.length = 0;
        this.licensesNameArray.length = 0;
    }
    this.setAcaLabelName = function (licIdentity, sAcaLabelName) {
        this.licObjARRAY[this.licensesNameArray[licIdentity]].AcaLabelName = sAcaLabelName;
    }
    this.SetExprFieldName = function (licIdentity, sExprFieldName) {
        this.licObjARRAY[this.licensesNameArray[licIdentity]].ExprFieldName = sExprFieldName;
    }
    this.SetMessage = function (licIdentity, message) {
        this.licObjARRAY[this.licensesNameArray[licIdentity]].Message += message;
    }
    this.SetSelected = function (licIdentity, bIsSelected) {
        this.licObjARRAY[this.licensesNameArray[licIdentity]].IsSelected = bIsSelected;
    }
    this.GetQuantity = function (licIdentity) {
        var qty = "1";

        if (licIdentity == LIC19_TRAIL_SUPPORTER_PATCH)
            qty = this.Quantity_Trail_Supporter_Patch;
        if (licIdentity == LIC17_VENISON_DONATION)
            qty = this.Quantity_Venison_Donation;
        if (licIdentity == LIC21_CONSERVATION_PATRON)
            qty = this.Quantity_Conservation_Patron;
        if (licIdentity == LIC18_CONSERVATION_FUND)
            qty = this.Quantity_Conservation_Fund;
        if (licIdentity == LIC20_CONSERVATIONIST_MAGAZINE)
            qty = this.Quantity_Conservationist_Magazine;
        if (licIdentity == LIC16_HABITAT_ACCESS_STAMP)
            qty = this.Quantity_Habitat_Stamp;

        return parseInt(qty, 10);
    }
    this.getRulesParam = function () {
        var now = new Date();
        var ruleParams = new rulePARAMS(this.Identity);

        ruleParams.Age = this.getAge(this.DOB);
        ruleParams.Gender = this.Gender;
        ruleParams.IsLegallyBlind = (isNull(this.IsLegallyBlind, '').toLowerCase() == "yes");
        ruleParams.IsPermanentDisabled = (isNull(this.IsPermanentDisabled, '').toLowerCase() == "yes");
        ruleParams.IsMinor = (this.IsMinor ? isNull(this.IsMinor, '').toLowerCase() == "yes" : false);
        ruleParams.IsNyResiDent = (this.IsNyResiDent ? isNull(this.IsNyResiDent, '').toLowerCase() == "yes" : false);
        ruleParams.PreferencePoints = this.PreferencePoints;
        ruleParams.IsDisableForYear = ruleParams.IsPermanentDisabled || this.IsDisableForYear(this.Year);
        ruleParams.IsMilitaryServiceman = (this.IsMilitaryServiceman ? isNull(this.IsMilitaryServiceman, '').toLowerCase() == "yes" : false);
        ruleParams.IsNativeAmerican = (this.isNYSDEC_HQ || this.isNative_American_Agency) && (this.IsNativeAmerican ? isNull(this.IsNativeAmerican, '').toLowerCase() == "yes" : false);
        ruleParams.HasHuntEd = this.HasHuntEd();
        ruleParams.HasBowHunt = this.HasBowHunt();
        ruleParams.HasTrapEd = this.HasTrapEd();
        ruleParams.HasNYSSportEd = this.HasNYSSportEd();
        ruleParams.ActiveHoldingsInfo = this.ActiveHoldingsInfo;
        ruleParams.currDrawType = getDrawTypeByPeriod(now.getFullYear());
        ruleParams.Year = this.Year;
        ruleParams.AgedIn = this.AgedIn;
        ruleParams.NeedHuntEd = this.NeedHuntEd;
        ruleParams.HasJtHuntTagsItem = this.licObjARRAY[this.licensesNameArray[LIC01_JUNIOR_HUNTING_TAGS]].IsSelected;
        ruleParams.HasBowPriv = this.HasBowPriv;
        ruleParams.HasMuzzPriv = this.HasMuzzPriv;
        ruleParams.EitherOrAntler = this.EitherOrAntler;
        return ruleParams;
    }
    this.setLoginUserType = function () {
        var isvalid = false;
        var uObj;

        if (this.UserIdEB == null) {
            uObj = new USEROBJ(publicUserID);
        }
        else {
            uObj = new USEROBJ();
            uObj.userId = this.UserIdEB;
            uObj.userModel = uObj.getUserModel();
            uObj.setUserModelAttributes();
        }

        this.isPublicUser = (uObj.acctType == 'CITIZEN');

        if (!this.isPublicUser) {
            var salesAgentInfoArray = getAgentInfo(uObj.publicUserID, uObj);
            this.isCallcenter = (salesAgentInfoArray["Agent Group"] == "Call Center" || salesAgentInfoArray["Agent Group"] == "Call Centre");
            this.isCampsite = (salesAgentInfoArray["Agent Group"] == "Campsite");
            this.isMunicipality = (salesAgentInfoArray["Agent Group"] == "Municipality");
            this.isNYSDEC_HQ = (salesAgentInfoArray["Agent Group"] == "NYSDEC HQ");
            this.isNYSDEC_Regional_Office = (salesAgentInfoArray["Agent Group"] == "NYSDEC Regional Office");
            this.isNative_American_Agency = (salesAgentInfoArray["Agent Group"] == "Native American Agency");
            this.isRetail = (salesAgentInfoArray["Agent Group"] == "Retail");
        }
    }
    this.ExecuteBoRuleEngine = function () {
        this.CountHunterGroup = 0;
        this.CountFishGroup = 0;
        this.CountLifeTimeGroup = 0;
        this.CountOtherSaleGroup = 0;
        this.currDrawType = getDrawTypeByPeriod(this.Year);
        this.setLoginUserType();
        //Set Licenses using form appliaction object and BO rule to do various operation in EB and SCRIPTs 
        //e.g Make linsces disabled id prerequiste is not set;

        //Create Rules Param object
        var ruleParams = this.getRulesParam();

        //Get Vesion Items for Year Only
        if (this.Year == null || this.Year == '') {
            this.VersionItems = new Array();
            //DO Nothing
            //var overlapPeriod = GetOverLapPeriod();
            //this.Year = overlapPeriod[0];
            //this.VersionItems = this.versions.GetVersionItems(this.Year);
        } else {
            this.VersionItems = this.versions.GetVersionItems(this.Year);
        }

        for (var idx = 0; idx < this.licObjARRAY.length; idx++) {
            //1. Availability Rules
            //var lic = new License_OBJ();
            var lic = this.licObjARRAY[idx];
            var isSelectable = false;
            var isActive = false;
            isActive = this.IsActiveItem(lic.Identity);
            this.SetItemFeeSched(lic.Identity, ruleParams);

            if (isActive) {
                eval("isSelectable = " + this.licObjARRAY[idx].FNIsSelectableRule + "(ruleParams);");
                this.setBoMessage(this.licObjARRAY[idx].Identity);

                if (this.optmzType == OPTZ_TYPE_ALLFEES || (this.optmzType == OPTZ_TYPE_SELECTED_FEES && this.licObjARRAY[idx].IsSelected)) {
                    //if (this.optmzType == OPTZ_TYPE_ALLFEES || (this.optmzType == OPTZ_TYPE_SELECTED_FEES && this.licObjARRAY[idx].IsSelected) || this.optmzType == OPTZ_TYPE_CTRC) {
                    var ofd = getFeeCodeByRule(ruleParams, this.licObjARRAY[idx].feeschedule, this.licObjARRAY[idx].feeversion, this.licObjARRAY[idx].FNfeeRule);
                    //eval("var feeItemCodes = " + this.licObjARRAY[idx].FNfeeRule + "(ruleParams, " + this.licObjARRAY[idx].feeschedule + " );");

                    if (ofd != null) {
                        this.licObjARRAY[idx].feecode = ofd.feeCode;
                        this.licObjARRAY[idx].feeDesc = ofd.feeDesc;
                        this.licObjARRAY[idx].comments = ofd.comments;
                        this.licObjARRAY[idx].Code3commission = ofd.Code3commission + "";
                        this.licObjARRAY[idx].DecCode = GetItemCode(this.licObjARRAY[idx].Code3commission + "");
                        this.licObjARRAY[idx].CodeDescription = GetItemCodedesc(this.licObjARRAY[idx].DecCode);
                        this.licObjARRAY[idx].formula = ofd.formula;
                        this.licObjARRAY[idx].feeUnit = this.GetQuantity(lic.Identity);

                        var mstr = '';
                        mstr += this.FromACA == "Yes" ? '<span class="DEC_price">$' : '';
                        mstr += this.licObjARRAY[idx].formula.toString();
                        mstr += ' [';
                        mstr += this.licObjARRAY[idx].DecCode;
                        mstr += ' - ';
                        mstr += this.licObjARRAY[idx].CodeDescription;
                        mstr += ']';
                        mstr += this.FromACA == "Yes" ? '</span>' : '';
                        //this.setBoMessage(this.licObjARRAY[idx].Identity);
                        if (this.licObjARRAY[idx].bomessage != '') {
                            mstr += " ";
                            mstr += this.licObjARRAY[idx].bomessage;
                        }

                        this.SetMessage(this.licObjARRAY[idx].Identity, mstr);
                    }
                }
                //TROUBLESHOOT
                //if (idx == 5) break;
                if (this.optmzType != OPTZ_TYPE_CTRC) {
                    this.licObjARRAY[idx].isSelectableByFee = isSelectable;

                    var isValidUser = true; // this.isValidUser(this.licObjARRAY[idx].Identity);
                    this.licObjARRAY[idx].isValidUser = isValidUser;

                    var isInActiveHoldings = this.isInActiveHoldings(this.licObjARRAY[idx].Identity, "SELECTION");
                    this.licObjARRAY[idx].isInActiveHoldings = isInActiveHoldings;

                    var isInCombo = this.isInCombo(this.licObjARRAY[idx].Identity, ruleParams);
                    this.licObjARRAY[idx].isInCombo = isInCombo;

                    var isRevoked = this.isRevoked(this.licObjARRAY[idx].Identity);
                    this.licObjARRAY[idx].isRevoked = isRevoked;

                    this.licObjARRAY[idx].IsActive = isActive;
                    this.licObjARRAY[idx].IsSelectable = (isActive && isSelectable && isValidUser && !isInCombo && !isInActiveHoldings && !isRevoked);
                }
            }

            if (this.optmzType != OPTZ_TYPE_CTRC) {
                //2. Check Prerequistes
                if (this.licObjARRAY[idx].PrereqisiteArray != null) {
                    var isHasPrereq = false;

                    for (var item in this.licObjARRAY[idx].PrereqisiteArray) {
                        var prereqstr = this.licObjARRAY[idx].PrereqisiteArray[item];
                        for (var iLdx = 0; iLdx < this.licObjARRAY.length; iLdx++) {
                            if (prereqstr == this.licObjARRAY[iLdx].Identity && this.licObjARRAY[iLdx].IsActive) {
                                isHasPrereq = this.licObjARRAY[iLdx].IsSelected;
                                if (!isHasPrereq) {
                                    isHasPrereq = this.isInActiveHoldings(this.licObjARRAY[iLdx].Identity, "PREREQ");
                                }
                                break;
                            }
                        }
                        if (isHasPrereq) {
                            break;
                        }
                    }
                    this.licObjARRAY[idx].isHasPrereq = isHasPrereq;
                    this.licObjARRAY[idx].IsSelectable = this.licObjARRAY[idx].IsSelectable && isHasPrereq;
                }
                //------
                if (this.licObjARRAY[idx].IsSelectable && this.licObjARRAY[idx].IsActive) {
                    if (HasHunterGroup(this.licObjARRAY[idx].Identity)) {
                        this.CountHunterGroup++;
                    }
                    else if (HasfishingGroup(this.licObjARRAY[idx].Identity)) {
                        this.CountFishGroup++;
                    }
                    else if (HasLifeTimeGroup(this.licObjARRAY[idx].Identity)) {
                        this.CountLifeTimeGroup++;
                    }
                    else if (HasOtherSaleGroup(this.licObjARRAY[idx].Identity)) {
                        this.CountOtherSaleGroup++;
                    }
                }
            }
            //if (idx == 42) break;
        }
		
		var msgNotQual = "The items are not available for selection because the customer is not qualified or they are already in current holdings.\n"
		var msgRevoked = "This set of privileges have been revoked and are not available for purchase. This issue can only be resolved by contacting DEC Law Enforcement during business hours at 518-402-8821.";
		var msgDEC = this.isPublicUser ? "Please contact DEC during business hours at 518-402-8821.\n" : "Instruct the customer that the only way to resolve this is to contact DEC during business hours at 518-402-8821.\n";
		
        if (this.CountHunterGroup == 0) {
            this.MessageHunter = msgNotQual + msgDEC;
        }
        if (this.Revoked_Hunting || this.Revoked_Trapping) {
            if (this.isPublicUser) {
                this.MessageHunter += msgRevoked;
            }
            this.MessageHunter += "Please Contact DEC.\n";
            this.ContactMsgLink_Hunt = CONTACT_LINK
        }
        if (this.CountFishGroup == 0) {
            this.MessageFish = msgNotQual + msgDEC;
        }
        if (this.Revoked_Fishing) {
            if (this.isPublicUser) {
                this.MessageFish += msgRevoked;
            }
            this.MessageFish += "Please Contact DEC.\n";
            this.ContactMsgLink_Fish = CONTACT_LINK
        }
        if (this.CountLifeTimeGroup == 0) {
            this.MessageLifeTime = msgNotQual + msgDEC;
        }
        if (this.Revoked_Hunting || this.Revoked_Trapping || this.Revoked_Fishing) {
            if (this.isPublicUser) {
                this.MessageLifeTime += msgRevoked;
            }
            this.MessageLifeTime += "Please Contact DEC.\n";
            this.ContactMsgLink_Lifetime = CONTACT_LINK
        }
        if (this.CountOtherSaleGroup == 0) {
            this.MessageOtherSale = msgNotQual + msgDEC;
        }
    }
    this.toString = function () {
        var result = '';
        var lf = this.FromACA == "Yes" ? '<br />' : ', ';

        var sbArray = new Array();
        var scArray = new Array();

        scArray.push("optmzType : ");
        sbArray.push(this.optmzType);
        scArray.push("gCaller : ");
        sbArray.push(gCaller);
        scArray.push("Identity : ");
        sbArray.push(this.Identity);
        scArray.push("EB : ");
        sbArray.push(this.EB);
        scArray.push("FromACA : ");
        sbArray.push(this.FromACA);
        scArray.push("UserIdEB : ");
        sbArray.push(this.UserIdEB);
        scArray.push("isPublicUser : ");
        sbArray.push(this.isPublicUser);
        scArray.push("isCallcenter : ");
        sbArray.push(this.isCallcenter);
        scArray.push("isCampsite : ");
        sbArray.push(this.isCampsite);
        scArray.push("isMunicipality : ");
        sbArray.push(this.isMunicipality);
        scArray.push("isNYSDEC_HQ : ");
        sbArray.push(this.isNYSDEC_HQ);
        scArray.push("isNYSDEC_Regional_Office : ");
        sbArray.push(this.isNYSDEC_Regional_Office);
        scArray.push("isNative_American_Agency : ");
        sbArray.push(this.isNative_American_Agency);
        scArray.push("isRetail : ");
        sbArray.push(this.isRetail);

        scArray.push("RecordType : ");
        sbArray.push(this.RecordType);
        scArray.push("Year : ");
        sbArray.push(this.Year);
        //sbArray.push(this.versions)
        //sbArray.push(this.VersionItems)

        //Contact Information
        scArray.push("FirstName : ");
        sbArray.push(this.FirstName);
        scArray.push("MiddleName : ");
        sbArray.push(this.MiddleName);
        scArray.push("LastName : ");
        sbArray.push(this.LastName);
        scArray.push("FullName : ");
        sbArray.push(this.FullName);

        scArray.push("DOB : ");
        sbArray.push(this.DOB);
        scArray.push("Age : ");
        sbArray.push(this.getAge(this.DOB));
        scArray.push("Gender : ");
        sbArray.push(this.Gender);

        scArray.push("Country : ");
        sbArray.push(this.Country);
        scArray.push("AddressLine1 : ");
        sbArray.push(this.AddressLine1);
        scArray.push("AddressLine2 : ");
        sbArray.push(this.AddressLine2);
        scArray.push("City : ");
        sbArray.push(this.City);
        scArray.push("State : ");
        sbArray.push(this.State);
        scArray.push("Zip : ");
        sbArray.push(this.Zip);

        scArray.push("DayTimePhone : ");
        sbArray.push(this.DayTimePhone);
        scArray.push("WorkPhone : ");
        sbArray.push(this.WorkPhone);
        scArray.push("MobilePhone : ");
        sbArray.push(this.MobilePhone);
        scArray.push("Fax : ");
        sbArray.push(this.Fax);
        scArray.push("Email : ");
        sbArray.push(this.Email);

        scArray.push("IsNyResiDent : ");
        sbArray.push(this.IsNyResiDent);
        scArray.push("IsNyResiDent Decode : ");
        sbArray.push(this.IsNyResiDent ? isNull(this.IsNyResiDent, '').toLowerCase() == "yes" : false);
        scArray.push("IsMinor : ");
        sbArray.push(this.IsMinor);
        scArray.push("IsMinor Dcode : ");
        sbArray.push(this.IsMinor ? isNull(this.IsMinor, '').toLowerCase() == "yes" : false);
        scArray.push("IsLegallyBlind : ");
        sbArray.push(this.IsLegallyBlind);
        scArray.push("IsLegallyBlind Decode : ");
        sbArray.push(isNull(this.IsLegallyBlind, '').toLowerCase() == "yes");
        scArray.push("IsPermanentDisabled : ");
        sbArray.push(this.IsPermanentDisabled);
        scArray.push("IsDisableForYear : ");
        sbArray.push(this.IsDisableForYear(this.Year));
        scArray.push("IsPermanentDisabled Decode : ");
        sbArray.push(isNull(this.IsPermanentDisabled, '').toLowerCase() == "yes");
        scArray.push("IsNativeAmerican : ");
        sbArray.push(this.IsNativeAmerican);
        scArray.push("IsNativeAmerican Decode : ");
        sbArray.push((this.isNYSDEC_HQ || this.isNative_American_Agency) && (this.IsNativeAmerican ? isNull(this.IsNativeAmerican, '').toLowerCase() == "yes" : false));
        scArray.push("PreferencePoints : ");
        sbArray.push(this.PreferencePoints);

        //MILITARY ACTIVE SERVICE STATUS
        scArray.push("IsMilitaryServiceman :");
        sbArray.push(this.IsMilitaryServiceman);
        scArray.push("IsMilitaryServiceman Decode : ");
        sbArray.push(this.IsMilitaryServiceman ? isNull(this.IsMilitaryServiceman, '').toLowerCase() == "yes" : false);

        //APPEARANCE
        scArray.push("Height : ");
        sbArray.push(this.Height);
        scArray.push("EyeColor : ");
        sbArray.push(this.EyeColor);

        scArray.push("CountHunterGroup : ");
        sbArray.push(this.CountHunterGroup);
        scArray.push("MessageHunter : ");
        sbArray.push(this.MessageHunter);
        scArray.push("CountFishGroup : ");
        sbArray.push(this.CountFishGroup);
        scArray.push("MessageFish : ");
        sbArray.push(this.MessageFish);
        scArray.push("CountLifeTimeGroup : ");
        sbArray.push(this.CountLifeTimeGroup);
        scArray.push("MessageLifeTime : ");
        sbArray.push(this.MessageLifeTime);
        scArray.push("CountOtherSaleGroup : ");
        sbArray.push(this.CountOtherSaleGroup);
        scArray.push("MessageOtherSale : ");
        sbArray.push(this.MessageOtherSale);
        scArray.push("Quantity_Trail_Supporter_Patch : ");
        sbArray.push(this.Quantity_Trail_Supporter_Patch);
        scArray.push("Quantity_Venison_Donation : ");
        sbArray.push(this.Quantity_Venison_Donation);
        scArray.push("Quantity_Conservation_Patron : ");
        sbArray.push(this.Quantity_Conservation_Patron);
        scArray.push("Quantity_Conservation_Fund : ");
        sbArray.push(this.Quantity_Conservation_Fund);
        scArray.push("Quantity_Conservationist_Magazine : ");
        sbArray.push(this.Quantity_Conservationist_Magazine);
        scArray.push("Quantity_Habitat_Stamp : ");
        sbArray.push(this.Quantity_Habitat_Stamp);
        scArray.push("Inscription : ");
        sbArray.push(this.Inscription);
        scArray.push("Suspended : ");
        sbArray.push(this.Suspended);
        scArray.push("Revoked_Hunting : ");
        sbArray.push(this.Revoked_Hunting);
        scArray.push("Revoked_Trapping : ");
        sbArray.push(this.Revoked_Trapping);
        scArray.push("Revoked_Fishing : ");
        sbArray.push(this.Revoked_Fishing);
        scArray.push("currDrawType : ");
        sbArray.push(this.currDrawType);
        scArray.push("NeedHuntEd : ");
        sbArray.push(this.NeedHuntEd);
        scArray.push("AgedIn : ");
        sbArray.push(this.AgedIn);

        scArray.push("HasHuntEd : ");
        sbArray.push(this.HasHuntEd());
        scArray.push("HasBowHunt : ");
        sbArray.push(this.HasBowHunt());
        scArray.push("HasTrapEd : ");
        sbArray.push(this.HasTrapEd());
        scArray.push("HasNYSSportEd : ");
        sbArray.push(this.HasNYSSportEd());
        scArray.push("GetSportsmanEducationStr : ");
        sbArray.push(this.GetSportsmanEducationStr());
        scArray.push("GetActiveHoldingsInfoStr : ");
        sbArray.push(this.GetActiveHoldingsInfoStr());

        for (var c in sbArray) {
            result += scArray[c];
            result += sbArray[c];
            result += lf;
        }
        for (var idx = 0; idx < this.licObjARRAY.length; idx++) {
            var oLic = this.licObjARRAY[idx];
            result += oLic.toString(this.FromACA);
            result += lf;
        }
        return result;
    }
    this.getAllFeeToAdd = function () {
        var arrayAddFee = new Array();
        for (var idx = 0; idx < this.licObjARRAY.length; idx++) {
            var oLic = this.licObjARRAY[idx];
            if (oLic.IsSelected) {
                var newfd = new FeeDef();
                newfd.feeschedule = oLic.feeschedule;
                newfd.feeCode = oLic.feecode;
                newfd.formula = oLic.formula;
                newfd.feeUnit = oLic.feeUnit;
                newfd.feeDesc = oLic.feeDesc;
                newfd.comments = oLic.comments;
                newfd.Code3commission = oLic.Code3commission;
                newfd.version = oLic.feeversion;
                arrayAddFee.push(newfd);
            }
        }
        return arrayAddFee;
    }
    this.getSelectedRecordTypes = function () {
        var arrayRecs = new Array();
        for (var idx = 0; idx < this.licObjARRAY.length; idx++) {
            var oLic = this.licObjARRAY[idx];
            if (oLic.IsSelected) {
                arrayRecs.push(oLic.RecordType);
            }
        }
        return arrayRecs;
    }
    //NOT USED
    this.getAllFeeToDisplayACA = function () {
        var arrayFeeText = new Array();
        for (var idx = 0; idx < this.licObjARRAY.length; idx++) {
            var oLic = this.licObjARRAY[idx];
            arrayFeeText.push('appendSpanText("' + oLic.AcaLabelName + '", "($' + oLic.formula + ')");');
        }
        return arrayFeeText.join("");
    }
    //NOT USED
    this.getEstimatedAmt = function () {
        var arrayFeeAmt = new Array();
        var totalAmt = new Number(0);
        for (var idx = 0; idx < this.licObjARRAY.length; idx++) {
            var oLic = this.licObjARRAY[idx];
            if (oLic.IsSelected) {
                arrayFeeAmt.push(parseFloat(oLic.formula) * parseFloat(oLic.feeUnit));
            }
        }
        for (var item in arrayFeeAmt) {
            totalAmt += parseFloat(arrayFeeAmt[item]);
        }
        return parseFloat(totalAmt).toFixed(2);
    }
    //NOT USED
    this.getAllFeeText = function () {
        var arrayFeeText = new Array();
        for (var idx = 0; idx < this.licObjARRAY.length; idx++) {
            var oLic = this.licObjARRAY[idx];
            if (oLic.IsSelectable) {
                arrayFeeText.push(oLic.feeDesc + " = " + oLic.formula);
            }
        }
        return arrayFeeText.join("\n");
    }
    this.getAge = function getAGE(argbirthDate) {
        var now = new Date();
        var birthDate = new Date(argbirthDate);

        function isLeap(year) {
            return year % 4 == 0 && (year % 100 != 0 || year % 400 == 0);
        }

        // days since the birthdate    
        var days = Math.floor((now.getTime() - birthDate.getTime()) / 1000 / 60 / 60 / 24);
        var age = 0;
        // iterate the years
        for (var y = birthDate.getFullYear(); y <= now.getFullYear(); y++) {
            var daysInYear = isLeap(y) ? 366 : 365;
            if (days >= daysInYear) {
                days -= daysInYear;
                age++;
                // increment the age only if there are available enough days for the year.
            }
        }
        return age;
    }

    //Method to test
    this.addGender = function (psRef) {
        this.Gender = psRef;

        return this;
    }

    this.IsActiveItem = function (psRef) {
        var active = false;
        for (var item in this.VersionItems) {
            if (this.VersionItems[item].Identity == psRef) {
                active = true;
                break;
            }
        }
        return active;
    }
    this.SetEitherOrAntler = function (eEitherOrAntler) {
        //eEitherOrAntler=4:E; eEitherOrAntler=8:A;
        this.EitherOrAntler = this.EitherOrAntler | eEitherOrAntler;
    }
    this.getAllDecCodes = function () {
        //All Cure
        var validActiveholdingsArray = getActiveholdingsFilterArray();
        var arrayCodes = new Array();
        for (var idx = 0; idx < this.licObjARRAY.length; idx++) {
            var oLic = this.licObjARRAY[idx];
            if (oLic.IsSelectable) {
                if (exists(oLic.RecordType, validActiveholdingsArray)) {
                    arrayCodes.push(oLic.DecCode);
                    if (oLic.RecordType == "" || true) { //priya: Need all bow priv record Types
                        this.HasBowPriv = true;
                    }
                    if (oLic.RecordType == "" || true) { //priya: Need all muzz priv record Types
                        this.HasMuzzPriv = true;
                    }
                }
            }
        }

        //Item Codes in Tag
        var arrayInActiveHold = new Array();
        for (var idx = 0; idx < this.ActiveHoldingsInfo.length; idx++) {
            if (isNull(this.ActiveHoldingsInfo[idx].RecordType, "") != "") {
                if (oLic.RecordType == "" || true) { //priya: Need all bow priv record Types
                    this.HasBowPriv = true;
                }
                if (oLic.RecordType == "" || true) { //priya: Need all muzz priv record Types
                    this.HasMuzzPriv = true;
                }
                var ats = this.ActiveHoldingsInfo[idx].RecordType;
                var ata = this.ActiveHoldingsInfo[idx].RecordType.split("/");
                if (ata[1] != "Tag") {
                    arrayInActiveHold.push(this.ActiveHoldingsInfo[idx].ItemCode)
                }
                if (ats == AA48_TAG_BOW_MUZZ_EITHER_SEX) {
                    this.SetEitherOrAntler(4);
                }
                if (ats == AA49_TAG_BOW_MUZZ_ANTLERLESS) {
                    this.SetEitherOrAntler(8);
                }
            }
        }
        var arraytmp = arrayUnique(arrayInActiveHold.concat(arrayCodes));

        return arraytmp.join(",");
    }
    this.isActiveFishingLic = function (effectiveDtStr, fishLicType) {
        var retMsg = '';
        for (var idx = 0; idx < this.ActiveHoldingsInfo.length; idx++) {
            var verifyLicArray = new Array();
            verifyLicArray.push(AA22_FRESHWATER_FISHING);
            verifyLicArray.push(AA23_NONRES_FRESHWATER_FISHING);
            if (fishLicType == "1 Day") {
                verifyLicArray.push(AA25_NONRESIDENT_7_DAY_FISHING);
                verifyLicArray.push(AA26_SEVEN_DAY_FISHING_LICENSE);
                verifyLicArray.push(AA03_ONE_DAY_FISHING_LICENSE);
                verifyLicArray.push(AA24_NONRESIDENT_1_DAY_FISHING);
            }
            if (fishLicType == "7 Day") {
                verifyLicArray.push(AA25_NONRESIDENT_7_DAY_FISHING);
                verifyLicArray.push(AA26_SEVEN_DAY_FISHING_LICENSE);
            }

            if (exists(this.ActiveHoldingsInfo[idx].RecordType, verifyLicArray)) {
                var fromDate = isNull(this.ActiveHoldingsInfo[idx].FromDate, '');
                var toDate = isNull(this.ActiveHoldingsInfo[idx].ToDate, '');
                if (fromDate != '' && toDate != '') {
                    var fromDT = new Date(fromDate);
                    var toDT = new Date(toDate);
                    var openDT = new Date(effectiveDtStr);
                    var expDT = new Date(dateAdd(new Date(effectiveDtStr), 365));
                    if (fishLicType == "1 Day") {
                        expDT = new Date(dateAdd(new Date(effectiveDtStr), 1));
                    }
                    else if (fishLicType == "7 Day") {
                        expDT = new Date(dateAdd(new Date(effectiveDtStr), 7));
                    }
                    if ((openDT >= fromDT && openDT <= toDT) || (expDT >= fromDT && expDT <= toDT)) {
                        retMsg = "Already has fishing license valid from " + fromDate + " to " + toDate;
                        break;
                    }
                    retMsg += '<br />';
                }
            }
        }
        return retMsg;
    }
    this.isActiveMarine = function (effectiveDtStr, marineLicType) {
        var retMsg = '';
        for (var idx = 0; idx < this.ActiveHoldingsInfo.length; idx++) {
            var verifyLicArray = new Array();
            verifyLicArray.push(AA02_MARINE_REGISTRY);

            if (exists(this.ActiveHoldingsInfo[idx].RecordType, verifyLicArray)) {
                var fromDate = isNull(this.ActiveHoldingsInfo[idx].FromDate, '');
                var toDate = isNull(this.ActiveHoldingsInfo[idx].ToDate, '');
                if (fromDate != '' && toDate != '') {
                    var fromDT = dateAdd(new Date(effectiveDtStr), 365);
                    var toDT = dateAdd(new Date(effectiveDtStr), 365);
                    var openDT = new Date(effectiveDtStr);
                    var expDT = dateAdd(new Date(effectiveDtStr), 365);

                    if (openDT >= fromDate && openDT <= toDT || expDT >= fromDate && expDT <= toDT) {
                        retMsg = "Already has marine registration valid from " + fromDate + " to " + toDate;
                        break;
                    }
                }
            }
        }
        return retMsg;
    }
    this.isAfterSwitchDate = function () {
        return this.isAfterSwitchDateFlag;
    }
    this.SetItemFeeSched = function (psRef, ruleParams) {
        for (var item in this.VersionItems) {
            if (this.VersionItems[item].Identity == psRef) {
                this.licObjARRAY[this.licensesNameArray[psRef]].FNTagsArray = this.VersionItems[item].FNTagsArray;
                this.licObjARRAY[this.licensesNameArray[psRef]].feeschedule = this.VersionItems[item].feeschedule;
                this.licObjARRAY[this.licensesNameArray[psRef]].feeversion = this.VersionItems[item].feeversion;
                this.licObjARRAY[this.licensesNameArray[psRef]].FNfeeRule = this.VersionItems[item].FNfeeRule;
                this.licObjARRAY[this.licensesNameArray[psRef]].FNIsSelectableRule = this.VersionItems[item].FNIsSelectableRule;
                this.licObjARRAY[this.licensesNameArray[psRef]].RecordType = this.VersionItems[item].RecordType;
                this.licObjARRAY[this.licensesNameArray[psRef]].FNPrereqisiteArray = this.VersionItems[item].FNPrereqisiteArray;
                this.licObjARRAY[this.licensesNameArray[psRef]].FNIncludesArray = this.VersionItems[item].FNIncludesArray;

                var PrereqisiteArray = null;
                if (isNull(this.licObjARRAY[this.licensesNameArray[psRef]].FNPrereqisiteArray, '') != '') {
                    eval("PrereqisiteArray = " + this.licObjARRAY[this.licensesNameArray[psRef]].FNPrereqisiteArray + "(ruleParams);");
                }
                this.licObjARRAY[this.licensesNameArray[psRef]].PrereqisiteArray = PrereqisiteArray;


                var IncludesArray = null;
                if (isNull(this.licObjARRAY[this.licensesNameArray[psRef]].FNIncludesArray, '') != '') {
                    eval("IncludesArray = " + this.licObjARRAY[this.licensesNameArray[psRef]].FNIncludesArray + "(ruleParams);");
                }
                this.licObjARRAY[this.licensesNameArray[psRef]].IncludesArray = IncludesArray;

                break;
            }
        }
    }

    this.SetOtherSaleExcludes = function (psRef) {
        this.SetExprFieldName(LIC01_JUNIOR_HUNTING_TAGS, "");
        this.SetExprFieldName(LIC02_MARINE_REGISTRY, "");
        this.SetExprFieldName(LIC03_ONE_DAY_FISHING_LICENSE, "");
        this.SetExprFieldName(LIC04_BOWHUNTING_PRIVILEGE, "");
        this.SetExprFieldName(LIC05_DEER_MANAGEMENT_PERMIT, "");
        this.SetExprFieldName(LIC06_HUNTING_LICENSE, "");
        this.SetExprFieldName(LIC07_MUZZLELOADING_PRIVILEGE, "");
        this.SetExprFieldName(LIC08_TURKEY_PERMIT, "");
        this.SetExprFieldName(LIC09_LIFETIME_BOWHUNTING, "");
        this.SetExprFieldName(LIC10_LIFETIME_FISHING, "");
        this.SetExprFieldName(LIC11_LIFETIME_MUZZLELOADING, "");
        this.SetExprFieldName(LIC12_LIFETIME_SMALL_AND_BIG_GAME, "");
        this.SetExprFieldName(LIC13_LIFETIME_SPORTSMAN, "");
        this.SetExprFieldName(LIC14_LIFETIME_TRAPPING, "");
        this.SetExprFieldName(LIC15_TRAPPING_LICENSE, "");
        this.SetExprFieldName(LIC16_HABITAT_ACCESS_STAMP, "ASI::OTHER SALES::Habitat/Access Stamp");
        this.SetExprFieldName(LIC17_VENISON_DONATION, "ASI::OTHER SALES::Venison Donation");
        this.SetExprFieldName(LIC18_CONSERVATION_FUND, "ASI::OTHER SALES::Conservation Fund");
        this.SetExprFieldName(LIC19_TRAIL_SUPPORTER_PATCH, "ASI::OTHER SALES::Trail Supporter Patch");
        this.SetExprFieldName(LIC20_CONSERVATIONIST_MAGAZINE, "ASI::OTHER SALES::Conservationist Magazine");
        this.SetExprFieldName(LIC21_CONSERVATION_PATRON, "ASI::OTHER SALES::Conservation Patron");
        this.SetExprFieldName(LIC22_FRESHWATER_FISHING, "");
        this.SetExprFieldName(LIC23_NONRES_FRESHWATER_FISHING, "");
        this.SetExprFieldName(LIC24_NONRESIDENT_1_DAY_FISHING, "");
        this.SetExprFieldName(LIC25_NONRESIDENT_7_DAY_FISHING, "");
        this.SetExprFieldName(LIC26_SEVEN_DAY_FISHING_LICENSE, "");
        this.SetExprFieldName(LIC27_CONSERVATION_LEGACY, "");
        this.SetExprFieldName(LIC28_JUNIOR_BOWHUNTING, "");
        this.SetExprFieldName(LIC29_JUNIOR_HUNTING, "");
        this.SetExprFieldName(LIC30_NONRES_MUZZLELOADING, "");
        this.SetExprFieldName(LIC31_NONRES_SUPER_SPORTSMAN, "");
        this.SetExprFieldName(LIC32_NONRESIDENT_BEAR_TAG, "");
        this.SetExprFieldName(LIC33_NONRESIDENT_BIG_GAME, "");
        this.SetExprFieldName(LIC34_NONRESIDENT_BOWHUNTING, "");
        this.SetExprFieldName(LIC35_NONRESIDENT_SMALL_GAME, "");
        this.SetExprFieldName(LIC36_NONRESIDENT_TURKEY, "");
        this.SetExprFieldName(LIC37_SMALL_AND_BIG_GAME, "");
        this.SetExprFieldName(LIC38_SMALL_GAME, "");
        this.SetExprFieldName(LIC39_SPORTSMAN, "");
        this.SetExprFieldName(LIC40_SUPER_SPORTSMAN, "");
        this.SetExprFieldName(LIC41_NONRESIDENT_TRAPPING, "");
        this.SetExprFieldName(LIC42_TRAPPER_SUPER_SPORTSMAN, "");
        this.SetExprFieldName(LIC43_LIFETIME_CARD_REPLACE, "ASI::OTHER SALES::Lifetime Card Replace");
        this.SetExprFieldName(LIC44_SPORTSMAN_ED_CERTIFICATION, "ASI::OTHER SALES::Sportsman Ed Certification");
        this.SetExprFieldName(LIC45_LIFETIME_INSCRIPTION, "");
    }

    this.isRevoked = function (psRef) {
        var retVal = false;

        for (var item in this.VersionItems) {
            if (this.VersionItems[item].Identity == psRef) {
                retVal = ((this.VersionItems[item].VerifyRevokedHunting && this.Revoked_Hunting) || (this.VersionItems[item].VerifyRevokedTrapping && this.Revoked_Trapping) || (this.VersionItems[item].VerifyRevokedFishing && this.Revoked_Fishing));
                break;
            }
        }
        return retVal;
    }
    this.isInActiveHoldings = function (psRef, reasonForCheck) {
        var isExist = false;
        for (var item in this.VersionItems) {
            if (this.VersionItems[item].Identity == psRef) {
                var isFound = false;
                if (reasonForCheck == "SELECTION") {
                    //Verify Recordtype required ActiveHolding Checking to display selection
                    var validActiveholdingsArray = getActiveholdingsFilterArray();
                    if (exists(this.VersionItems[item].RecordType, validActiveholdingsArray)) {
                        isFound = true;
                    }
                } else {
                    isFound = true;
                }
                if (isFound) {
                    for (var idx = 0; idx < this.ActiveHoldingsInfo.length; idx++) {
                        if (reasonForCheck == "SELECTION") {
                            if (this.ActiveHoldingsInfo[idx].RecordType == this.VersionItems[item].RecordType) {
                                isExist = (isNull(this.ActiveHoldingsInfo[idx].ToDate, '') == '');
                                if (!isExist) {
                                    isExist = ((dateDiff(new Date(), convertDate(this.ActiveHoldingsInfo[idx].ToDate))) > 0);
                                }
                                break;
                            }
                        }
                        if (reasonForCheck == "PREREQ") {
                            if (this.ActiveHoldingsInfo[idx].RecordType == this.VersionItems[item].RecordType) {
                                isExist = (isNull(this.ActiveHoldingsInfo[idx].ToDate, '') == '');
                                if (!isExist) {
                                    isExist = ((dateDiff(new Date(), convertDate(this.ActiveHoldingsInfo[idx].ToDate))) > 0);
                                }
                                break;
                            }
                        }
                    }
                }
                break;
            }
        }

        return isExist;
    }
    this.isInCombo = function (psRef, ruleParams) {
        var retVal = false;

        for (var x = 0; x < this.licObjARRAY.length; x++) {
            if (this.licObjARRAY[x].IsSelected || this.isInActiveHoldings(this.licObjARRAY[x].Identity, "SELECTION")) {
                for (var item in this.VersionItems) {
                    if (this.VersionItems[item].Identity == this.licObjARRAY[x].Identity) {
                        var sfnIncludesArray = this.VersionItems[item].FNIncludesArray;
                        var IncludesArray = null;
                        if (isNull(sfnIncludesArray, '') != '') {
                            eval("IncludesArray = " + sfnIncludesArray + "(ruleParams);");
                        }

                        if (IncludesArray != null) {
                            var arrayRecs = IncludesArray;
                            for (var jdx = 0; jdx < arrayRecs.length; jdx++) {
                                if (arrayRecs[jdx] == psRef) {
                                    retVal = true;
                                    break;
                                }
                            }
                        }
                        break;
                    }
                }
            }
        }
        return retVal;
    }
    this.isValidUser = function (psRef) {
        var retVal = true;

        if (psRef == LIC05_DEER_MANAGEMENT_PERMIT) {
            if (this.currDrawType == DRAW_FCFS) {
                retVal = !(this.isPublicUser || this.isCallcenter);
            }

        } else if (psRef == LIC19_TRAIL_SUPPORTER_PATCH) {
            retVal = !(this.isPublicUser || this.isCallcenter);
        }

        return retVal;
    }
    this.setBoMessage = function (psRef) {
        var poLoc = this.licObjARRAY[this.licensesNameArray[psRef]];

        if (psRef == LIC05_DEER_MANAGEMENT_PERMIT) {
            if (this.currDrawType == '') {
                poLoc.bomessage = 'DMP application not available. Closed for the season.';
                poLoc.IsDisabled = poLoc.IsDisabled || true;
            } else {
                poLoc.bomessage = this.currDrawType;
                //poLoc.bomessage = '<br />The actual DMP lottery/grant(s) results will be processed after full payment.';
                poLoc.bomessage = '<br />The actual DMP lottery will be run after full payment has been made and you will be notified of any DMP selections <b>OR EARNED PREFERENCE POINTS</> at that time.';
            }
        }
    }
    this.Init = function () {
        var actArray = new Array();
        var lic;

        if (false) { //To Test Outside make it true
            var RecordTypeArray = GetAllSalesItemsNames();
            for (var idx = 0; idx < RecordTypeArray.length; idx++) {
                lic = new License_OBJ(RecordTypeArray[idx]);
                this.licObjARRAY[this.licObjARRAY.length] = lic;
                this.licensesNameArray[RecordTypeArray[idx]] = this.licObjARRAY.length - 1;
            }
        }
        else {
            //Set License Rec
            //-------------------------
            var strControl = DEC_APP_LICENSE_TYPE;
            var bizDomScriptResult = aa.bizDomain.getBizDomain(strControl);
            if (bizDomScriptResult.getSuccess()) {
                bizDomScriptArray = bizDomScriptResult.getOutput().toArray()
                for (var i in bizDomScriptArray) {
                    // these are the same variable as lic type
                    eval(" " + bizDomScriptArray[i].getBizdomainValue() + " = '" + bizDomScriptArray[i].getDescription() + "';");
                    lic = new License_OBJ(bizDomScriptArray[i].getDescription(), true);
                    actArray.push(lic);
                }
            }
        }


        for (var idx in actArray) {
            lic = actArray[idx];
            this.licObjARRAY[this.licObjARRAY.length] = lic;
            this.licensesNameArray[lic.Identity] = this.licObjARRAY.length - 1;
        }
        //-------------------------

        //Set Expression Control Name for select licenses
        this.SetExprFieldName(LIC01_JUNIOR_HUNTING_TAGS, "ASI::HUNTING LICENSE::Junior Hunting Tags");
        this.SetExprFieldName(LIC02_MARINE_REGISTRY, "ASI::FISHING LICENSES::Marine Registry");
        this.SetExprFieldName(LIC03_ONE_DAY_FISHING_LICENSE, "ASI::FISHING LICENSES::One Day Fishing License");
        this.SetExprFieldName(LIC04_BOWHUNTING_PRIVILEGE, "ASI::HUNTING LICENSE::Bowhunting Privilege");
        this.SetExprFieldName(LIC05_DEER_MANAGEMENT_PERMIT, "ASI::HUNTING LICENSE::Deer Management Permit");
        this.SetExprFieldName(LIC06_HUNTING_LICENSE, "ASI::HUNTING LICENSE::Hunting License");
        this.SetExprFieldName(LIC07_MUZZLELOADING_PRIVILEGE, "ASI::HUNTING LICENSE::Muzzleloading Privilege");
        this.SetExprFieldName(LIC08_TURKEY_PERMIT, "ASI::HUNTING LICENSE::Turkey Permit");
        this.SetExprFieldName(LIC09_LIFETIME_BOWHUNTING, "ASI::LIFETIME LICENSES::Lifetime Bowhunting");
        this.SetExprFieldName(LIC10_LIFETIME_FISHING, "ASI::LIFETIME LICENSES::Lifetime Fishing");
        this.SetExprFieldName(LIC11_LIFETIME_MUZZLELOADING, "ASI::LIFETIME LICENSES::Lifetime Muzzleloading");
        this.SetExprFieldName(LIC12_LIFETIME_SMALL_AND_BIG_GAME, "ASI::LIFETIME LICENSES::Lifetime Small & Big Game");
        this.SetExprFieldName(LIC13_LIFETIME_SPORTSMAN, "ASI::LIFETIME LICENSES::Lifetime Sportsman");
        this.SetExprFieldName(LIC14_LIFETIME_TRAPPING, "ASI::LIFETIME LICENSES::Lifetime Trapping");
        this.SetExprFieldName(LIC15_TRAPPING_LICENSE, "ASI::HUNTING LICENSE::Trapping License");
        this.SetExprFieldName(LIC16_HABITAT_ACCESS_STAMP, "ASI::OTHER SALES::Habitat/Access Stamp");
        this.SetExprFieldName(LIC17_VENISON_DONATION, "ASI::OTHER SALES::Venison Donation");
        this.SetExprFieldName(LIC18_CONSERVATION_FUND, "ASI::OTHER SALES::Conservation Fund");
        this.SetExprFieldName(LIC19_TRAIL_SUPPORTER_PATCH, "ASI::OTHER SALES::Trail Supporter Patch");
        this.SetExprFieldName(LIC20_CONSERVATIONIST_MAGAZINE, "ASI::OTHER SALES::Conservationist Magazine");
        this.SetExprFieldName(LIC21_CONSERVATION_PATRON, "ASI::OTHER SALES::Conservation Patron");
        this.SetExprFieldName(LIC22_FRESHWATER_FISHING, "ASI::FISHING LICENSES::Freshwater Fishing");
        this.SetExprFieldName(LIC23_NONRES_FRESHWATER_FISHING, "ASI::FISHING LICENSES::NonRes Freshwater Fishing");
        this.SetExprFieldName(LIC24_NONRESIDENT_1_DAY_FISHING, "ASI::FISHING LICENSES::Nonresident 1 Day Fishing");
        this.SetExprFieldName(LIC25_NONRESIDENT_7_DAY_FISHING, "ASI::FISHING LICENSES::Nonresident 7 Day Fishing");
        this.SetExprFieldName(LIC26_SEVEN_DAY_FISHING_LICENSE, "ASI::FISHING LICENSES::Seven Day Fishing License");
        this.SetExprFieldName(LIC27_CONSERVATION_LEGACY, "ASI::HUNTING LICENSE::Conservation Legacy");
        this.SetExprFieldName(LIC28_JUNIOR_BOWHUNTING, "ASI::HUNTING LICENSE::Junior Bowhunting");
        this.SetExprFieldName(LIC29_JUNIOR_HUNTING, "ASI::HUNTING LICENSE::Junior Hunting");
        this.SetExprFieldName(LIC30_NONRES_MUZZLELOADING, "ASI::HUNTING LICENSE::NonRes Muzzleloading");
        this.SetExprFieldName(LIC31_NONRES_SUPER_SPORTSMAN, "ASI::HUNTING LICENSE::NonRes Super Sportsman");
        this.SetExprFieldName(LIC32_NONRESIDENT_BEAR_TAG, "ASI::HUNTING LICENSE::Nonresident Bear Tag");
        this.SetExprFieldName(LIC33_NONRESIDENT_BIG_GAME, "ASI::HUNTING LICENSE::Nonresident Big Game");
        this.SetExprFieldName(LIC34_NONRESIDENT_BOWHUNTING, "ASI::HUNTING LICENSE::Nonresident Bowhunting");
        this.SetExprFieldName(LIC35_NONRESIDENT_SMALL_GAME, "ASI::HUNTING LICENSE::Nonresident Small Game");
        this.SetExprFieldName(LIC36_NONRESIDENT_TURKEY, "ASI::HUNTING LICENSE::Nonresident Turkey");
        this.SetExprFieldName(LIC37_SMALL_AND_BIG_GAME, "ASI::HUNTING LICENSE::Small and Big Game");
        this.SetExprFieldName(LIC38_SMALL_GAME, "ASI::HUNTING LICENSE::Small Game");
        this.SetExprFieldName(LIC39_SPORTSMAN, "ASI::HUNTING LICENSE::Sportsman");
        this.SetExprFieldName(LIC40_SUPER_SPORTSMAN, "ASI::HUNTING LICENSE::Super Sportsman");
        this.SetExprFieldName(LIC41_NONRESIDENT_TRAPPING, "ASI::HUNTING LICENSE::Nonresident Trapping");
        this.SetExprFieldName(LIC42_TRAPPER_SUPER_SPORTSMAN, "ASI::HUNTING LICENSE::Trapper Super Sportsman");
        this.SetExprFieldName(LIC43_LIFETIME_CARD_REPLACE, "ASI::OTHER SALES::Lifetime Card Replace");
        this.SetExprFieldName(LIC44_SPORTSMAN_ED_CERTIFICATION, "ASI::OTHER SALES::Sportsman Ed Certification");
        this.SetExprFieldName(LIC45_LIFETIME_INSCRIPTION, "ASI::LIFETIME LICENSES::Lifetime Inscription");
    }

    this.Init();

    return this;
}
/*** License section ***/
function License_OBJ(identity, active) {
    this.Identity = identity;
    this.ExprFieldName = "";
    this.AcaLabelName = "";
    this.PrereqisiteArray = null;
    this.IncludesArray = null;
    this.TagsArray = null;
    this.IsSelected = false;
    this.IsActive = active;
    this.Message = "";
    this.DecCode = "";
    this.CodeDescription = "";

    //Rule engine setup
    this.IsSelectable = false;
    this.IsDisabled = false;
    this.feeschedule = null;
    this.feecode = null;
    this.feeversion = null;
    this.formula = null;
    this.Code3commission = null;
    this.feeUnit = new Number(1);
    this.feeDesc = null;
    this.comments = null;
    this.FNfeeRule = null;
    this.FNIsSelectableRule = null;
    this.FNPrereqisiteArray = null;
    this.FNIncludesArray = null;
    this.FNTagsArray = null;
    this.RecordType = "";
    this.bomessage = '';
    this.isValidUser = false;
    this.isInCombo = false;
    this.isInActiveHoldings = false;
    this.isRevoked = false;
    this.isHasPrereq = false;
    this.isSelectableByFee = false;
	this.isAfterSwitchDateFlag = isAfterSwitchDate();
	
    this.toString = function (fromAca) {
        var result = '';
        var lf = fromAca == "Yes" ? '<br />' : ', ';

        var sbArray = new Array();
        var scArray = new Array();

        scArray.push("Identity : ");
        sbArray.push(this.Identity);
        scArray.push("ExprFieldName : ");
        sbArray.push(this.ExprFieldName);
        scArray.push("AcaLabelName : ");
        sbArray.push(this.AcaLabelName);
        scArray.push("PrereqisiteArra : ");
        sbArray.push(this.PrereqisiteArray);
        scArray.push("IncludesArra : ");
        sbArray.push(this.IncludesArray);
        scArray.push("TagsArray : ");
        sbArray.push(this.TagsArray);
        scArray.push("Message : ");
        sbArray.push(this.Message);
        scArray.push("DecCode : ");
        sbArray.push(this.DecCode);
        scArray.push("CodeDescription : ");
        sbArray.push(this.CodeDescription);
        scArray.push("RecordType : ");
        sbArray.push(this.RecordType);

        var feestr = '';
        var fbArray = new Array();
        var fcArray = new Array();
        fcArray.push("IsSelected : ");
        fbArray.push(this.IsSelected);
        fcArray.push("isValidUser : ");
        fbArray.push(this.isValidUser);
        fcArray.push("IsActive : ");
        fbArray.push(this.IsActive);
        fcArray.push("isInCombo : ");
        fbArray.push(this.isInCombo);
        fcArray.push("isInActiveHoldings : ");
        fbArray.push(this.isInActiveHoldings);
        fcArray.push("isHasPrereq : ");
        fbArray.push(this.isHasPrereq);
        fcArray.push("isRevoked : ");
        fbArray.push(this.isRevoked);
        fcArray.push("isSelectableByFee : ");
        fbArray.push(this.isSelectableByFee);
        fcArray.push("IsSelectable : ");
        fbArray.push(this.IsSelectable);
        fcArray.push("IsDisabled : ");
        fbArray.push(this.IsDisabled);
        fcArray.push("bomessage : ");
        fbArray.push(this.bomessage);
        for (var c in fbArray) {
            feestr += fcArray[c];
            feestr += fbArray[c];
            feestr += ', ';
        }
        scArray.push("FLAG MODEL : ");
        sbArray.push("");
        scArray.push("");
        sbArray.push(feestr);

        feestr = '';
        fbArray = new Array();
        fcArray = new Array();
        fcArray.push("feeschedule : ");
        fbArray.push(this.feeschedule);
        fcArray.push("feecode : ");
        fbArray.push(this.feecode);
        fcArray.push("feeversion : ");
        fbArray.push(this.feeversion);
        fcArray.push("formula : ");
        fbArray.push(this.formula);
        fcArray.push("Code3commission : ");
        fbArray.push(this.Code3commission);
        fcArray.push("feeUnit : ");
        fbArray.push(this.feeUnit);
        fcArray.push("feeDesc : ");
        fbArray.push(this.feeDesc);
        fcArray.push("comments : ");
        fbArray.push(this.comments);
        fcArray.push("FNfeeRule : ");
        fbArray.push(this.FNfeeRule);
        fcArray.push("FNIsSelectableRule : ");
        fbArray.push(this.FNIsSelectableRule);
        fcArray.push("FNPrereqisiteArray : ");
        fbArray.push(this.FNPrereqisiteArray);
        fcArray.push("FNIncludesArray : ");
        fbArray.push(this.FNIncludesArray);
        fcArray.push("FNTagsArray : ");
        fbArray.push(this.FNTagsArray);

        for (var c in fbArray) {
            feestr += fcArray[c];
            feestr += fbArray[c];
            feestr += ', ';
        }
        scArray.push("FEE MODEL : ");
        sbArray.push("");
        scArray.push("");
        sbArray.push(feestr);
        //--------------------

        for (var c in sbArray) {
            result += scArray[c];
            result += sbArray[c];
            result += lf;
        }
        return result;
    }

    return this;
}
/*** Annual Disability section ***/
function ANNUAL_DISABILITY() {
    this.Year = "";
    this.AnnualDisabilityCaseNumber = "";
    this.FourtyPrcentMilitaryDisabled = "";
    this.LastDate = "";

    return this;
}
/*** Land Owner Onformation section ***/
function LAND_OWNER_INFORMATION() {
    this.LicenseYear = "";
    this.SWISCode = "";
    this.TaxMapID_ParcelID = "";
    this.IsDmpUse = "";
    this.LastDate = "";

    return this;
}
/*** Previous/Prior License section ***/
function PREVIOUS_LICENSE() {
    this.PreviousLicenseType = "";
    this.LicenseDate = "";
    this.LicenseNumber = "";
    this.State = "";
    this.Country = "";
    this.OtherCountry = "";
    this.Verified_By = "";
    this.LastDate = "";

    return this;
}
/*** Sportsman Eduction section ***/
function SPORTSMAN_EDUCTION() {
    this.EducationType = "";
    this.CertificateDate = "";
    this.CertificateNumber = "";
    this.State = "";
    this.Country = "";
    this.OtherCountry = "";
    this.LastDate = "";
    this.Revoked = "";

    return this;
}
/*** Active Holdings section ***/
function ACTVE_HOLDINGS() {
    this.ItemCode = "";
    this.Description = "";
    this.Tag_or_DocumentID = "";
    this.FromDate = "";
    this.ToDate = "";
    this.LicenseYear = "";
    this.Tag = "";
    this.RecordType = "";

    return this;
}
/*** Mapper Object ***/
function DecMapper(identity) {
    this.Identity = identity;
    this.Keys = new Array();
    this.Add = function () {
        for (c = 0; c < this.Add.arguments.length; c += 2) {
            this[this.Add.arguments[c]] = this.Add.arguments[c + 1];
            this.Keys.push(this.Add.arguments[c]);
        }
    }

    this.Lookup = function (key) {
        return (this[key]);
    }

    this.Delete = function () {
        for (c = 0; c < this.Delete.arguments.length; c++) {
            this[this.Delete.arguments[c]] = null;
        }
    }
}
/**** rules Parameter DTO Object ***/
function rulePARAMS(identity) {
    this.Identity = identity;
    this.Age = new Number(0);
    this.Gender = "";
    this.IsNyResiDent = false;
    this.Gender = "";
    this.IsMinor = false;
    this.IsLegallyBlind = false;
    this.IsPermanentDisabled = false;
    this.PreferencePoints = 0;
    this.IsDisableForYear = false;
    this.IsMilitaryServiceman = false;
    this.IsNativeAmerican = false;
    this.HasHuntEd = false;
    this.HasBowHunt = false;
    this.HasTrapEd = false;
    this.HasNYSSportEd = false;
    this.HasJtHuntTagsItem = false;
    this.AgedIn = false;
    this.NeedHuntEd = false;
    this.ActiveHoldingsInfo = new Array();
    this.currDrawType = '';
    this.Year = null;
    this.EitherOrAntler = 2; //1:None; 6=2|4:E; 14=2|4|8:A;
    this.HasBowPriv = false;
    this.HasMuzzPriv = false;

    this.SetEitherOrAntler = function (eEitherOrAntler) {
        //eEitherOrAntler=4:E; eEitherOrAntler=8:A;
        this.EitherOrAntler = this.EitherOrAntler | eEitherOrAntler;
    }

    this.isTagInActiveHodings = function (tagRecType, tagtype) {
        var isTagInActiveHodings = false;
        for (var idx = 0; idx < this.ActiveHoldingsInfo.length; idx++) {
            if (this.ActiveHoldingsInfo[idx].RecordType == tagRecType && this.ActiveHoldingsInfo[idx].ItemCode == tagtype) {
                isTagInActiveHodings = true;
                break;
            }
        }
        return isTagInActiveHodings;
    }
    this.HasLifetimelic = function () {
        var isValid = false;
        for (var idx = 0; idx < this.ActiveHoldingsInfo.length; idx++) {
            if (this.ActiveHoldingsInfo[idx].RecordType != undefined) {
                if (isNull(this.ActiveHoldingsInfo[idx].RecordType, "") != "") {
                    var ata = this.ActiveHoldingsInfo[idx].RecordType.split("/");
                    if (ata[1] == "Lifetime") {
                        isValid = true;
                        break;
                    }
                }
            }
        }
        return isValid;
    }
    this.HasJrHuntLic = function () {
        var isValid = false;
        for (var idx = 0; idx < this.ActiveHoldingsInfo.length; idx++) {
            var verifyLicArray = new Array();
            verifyLicArray.push(AA29_JUNIOR_HUNTING);
            verifyLicArray.push(LIC28_JUNIOR_BOWHUNTING);
            verifyLicArray.push(AA06_HUNTING_LICENSE);

            if (exists(this.ActiveHoldingsInfo[idx].RecordType, verifyLicArray)) {
                isValid = true;
                break;
            }
        }
        return isValid;
    }
    this.toString = function () {
        var result = '';
        var sbArray = new Array();
        var scArray = new Array();

        scArray.push("Identity : ");
        sbArray.push(this.Identity);
        scArray.push("Year : ");
        sbArray.push(this.Year);
        scArray.push("Age : ");
        sbArray.push(this.Age);
        scArray.push("IsNyResiDent : ");
        sbArray.push(this.IsNyResiDent);
        scArray.push("Gender : ");
        sbArray.push(this.Gender);
        scArray.push("IsMinor : ");
        sbArray.push(this.IsMinor);
        scArray.push("IsLegallyBlind : ");
        sbArray.push(this.IsLegallyBlind);
        scArray.push("IsPermanentDisabled : ");
        sbArray.push(this.IsPermanentDisabled);
        scArray.push("PreferencePoints : ");
        sbArray.push(this.PreferencePoints);
        scArray.push("IsDisableForYear : ");
        sbArray.push(this.IsDisableForYear);
        scArray.push("IsMilitaryServiceman : ");
        sbArray.push(this.IsMilitaryServiceman);
        scArray.push("HasHuntEd : ");
        sbArray.push(this.HasHuntEd);
        scArray.push("HasBowHunt : ");
        sbArray.push(this.HasBowHunt);
        scArray.push("HasTrapEd : ");
        sbArray.push(this.HasTrapEd);
        scArray.push("HasNYSSportEd : ");
        sbArray.push(this.HasNYSSportEd);
        scArray.push("ActiveHoldingsInfo : ");
        sbArray.push(this.ActiveHoldingsInfo);
        scArray.push("currDrawType : ");
        sbArray.push(this.currDrawType);
        scArray.push("NeedHuntEd : ");
        sbArray.push(this.NeedHuntEd);
        scArray.push("AgedIn : ");
        sbArray.push(this.AgedIn);
        scArray.push("HasLifetimelic : ");
        sbArray.push(this.HasLifetimelic());
        scArray.push("HasJrHuntLic : ");
        sbArray.push(this.HasJrHuntLic());
        scArray.push("HasJtHuntTagsItem: ");
        sbArray.push(this.HasJtHuntTagsItem);
        scArray.push("EitherOrAntler: ");
        sbArray.push(this.EitherOrAntler);
        scArray.push("HasBowPriv: ");
        sbArray.push(this.HasBowPriv);
        scArray.push("HasMuzzPriv: ");
        sbArray.push(this.HasMuzzPriv);

        for (var c in sbArray) {
            result += scArray[c];
            result += sbArray[c];
            result += '\n';
        }

        return result;
    }
}
/**** Fee methods/objects ***/
function FeeDef() {
    this.feeschedule = null;
    this.formula = null;
    this.Code3commission = null;
    this.feeUnit = null;
    this.feeDesc = null;
    this.feeCode = null;
    this.comments = null;
    this.version = null;
    this.DecCode = null;
}

function bubbleSort(elements) {
    for (var out = elements.length - 1; out > 0; out--) {
        for (var inn = 0; inn < out; inn++) {
            if (parseFloat(elements[inn].formula) > parseFloat(elements[inn + 1].formula)) {
                var t = elements[inn + 1];
                elements[inn + 1] = elements[inn];
                elements[inn] = t;
            }
        }
    }
    return elements;
}

function getFeeCodeByRule(ruleParams, feeSched, feeversion, fNfeeRule) {
    if (ruleParams && ruleParams.Identity != '') {
        var feeItemCodes = new Array();
        eval("feeItemCodes = " + fNfeeRule + "(ruleParams, feeSched);");

        //Check constant formula value
        var afd = new Array();
        for (var fc in feeItemCodes) {
            var ofd = getFeeDefByCode(feeSched, feeItemCodes[fc].feecode, feeversion, feeItemCodes[fc].DecCode);
            if (ofd) {
                afd[afd.length] = ofd;
            }
        }
        if (afd.length > 0) {
            afd = bubbleSort(afd);
            return afd[0];
        }
    } else {
        if (gCaller != GS2_EXPR) {
            logDebug("Error getting fee schedule " + arrFeesResult.getErrorMessage());
        }
    }
    return null;
}
/*** Accela Scripting Wrapper ***/
function getFeeDefByCode(fsched, feeCode, feeversion, decCode) {
    if (typeof aa != "undefined") {
        var arrFeesResult = aa.finance.getFeeItemList(null, fsched, feeversion, null, null);

        if (arrFeesResult.getSuccess()) {
            var arrFees = arrFeesResult.getOutput();
            for (var xx in arrFees) {
                var fCode = arrFees[xx].getFeeCod();
                if (fCode.equals(feeCode)) {
                    var f = new FeeDef();
                    f.feeschedule = fsched;
                    f.feeCode = fCode;
                    f.feeDesc = arrFees[xx].getFeeDes();
                    f.formula = arrFees[xx].getFormula();
                    f.Code3commission = arrFees[xx].getAccCodeL3();
                    var rft = arrFees[xx].getrFreeItem();
                    f.comments = rft.getComments();
                    f.DecCode = decCode;
                    return f;
                }
            } // for xx
        }
        else {
            if (gCaller != GS2_EXPR) {
                logDebug("Error getting fee schedule " + arrFeesResult.getErrorMessage());
            }
            return null;
        }
    }
    return null;
}
/***** ****/
function HasfishingGroup(psRef) {
    var retvalue = false;
    for (var item in arryfishingGroup) {
        if (arryfishingGroup[item] == psRef) {
            retvalue = true;
            break;
        }
    }
    return retvalue;
}
function HasHunterGroup(psRef) {
    var retvalue = false;
    for (var item in arryHunterGroup) {
        if (arryHunterGroup[item] == psRef) {
            retvalue = true;
            break;
        }
    }
    return retvalue;
}
function HasLifeTimeGroup(psRef) {
    var retvalue = false;
    for (var item in arryLifeTimeGroup) {
        if (arryLifeTimeGroup[item] == psRef) {
            retvalue = true;
            break;
        }
    }
    return retvalue;
}
function HasOtherSaleGroup(psRef) {
    var retvalue = false;
    for (var item in arryOtherSaleGroup) {
        if (arryOtherSaleGroup[item] == psRef) {
            retvalue = true;
            break;
        }
    }
    return retvalue;
}
function IsHuntEd(psRef) {
    var retvalue = false;
    for (var item in arryHuntEd) {
        if (arryHuntEd[item] == psRef) {
            retvalue = true;
            break;
        }
    }
    return retvalue;
}
function IsBowHunt(psRef) {
    var retvalue = false;
    for (var item in arryBowHunt) {
        if (arryBowHunt[item] == psRef) {
            retvalue = true;
            break;
        }
    }
    return retvalue;
}
function IsTrapEd(psRef) {
    var retvalue = false;
    for (var item in arryTrapEd) {
        if (arryTrapEd[item] == psRef) {
            retvalue = true;
            break;
        }
    }
    return retvalue;
}
function GetCommissionByUser(sAcctCode3, aSalesAgentInfoArray) {
    var retval = 0;
    if (isNull(sAcctCode3, '') != '') {
        var acmsn = sAcctCode3.split("|");
        var commBucket = 1; //Zero Commission
        if (aSalesAgentInfoArray != null) {
            var commCode = aSalesAgentInfoArray["Commission Code"];
            if (commCode == 'Standard Commission') {
                commBucket = 2; //Standard Commision
            }
        }

        var cmns = acmsn[commBucket].toString();
        if (cmns != null && cmns != '') {
            return parseFloat(cmns);
        }
    }
    return retval;
}
function GetItemCode(sAcctCode3) {
    var acmsn = sAcctCode3.split("|");
    return acmsn[0];
}
function GetItemCodedesc(itemcode) {
    var desc = "";
    if (itemcode != null && itemcode != "") {
        var bizDomScriptResult = aa.bizDomain.getBizDomainByValue("ITEM_CODES", itemcode);

        if (bizDomScriptResult.getSuccess()) {
            var bizDomScriptObj = bizDomScriptResult.getOutput();
            desc = "" + bizDomScriptObj.getDescription(); // had to do this or it bombs.  who knows why?
        }
    }
    var adesc = desc.split("|");

    return adesc[0];
}
function GetTagTypedesc(TagType) {
    var desc = "";
    if (TagType != null && TagType != "") {
        var bizDomScriptResult = aa.bizDomain.getBizDomainByValue("TAG_TYPE", TagType);

        if (bizDomScriptResult.getSuccess()) {
            var bizDomScriptObj = bizDomScriptResult.getOutput();
            desc = "" + bizDomScriptObj.getDescription(); // had to do this or it bombs.  who knows why?
        }
    }

    return desc;
}
function getDrawTypeByPeriod(year) {
    var now = new Date(jsDateToMMDDYYYY(new Date()));
    var retArray = GetDateRange("DEC_CONFIG", "DMP_INSTANT_LOTTERY_PERIOD", year)

    var currDrawType = '';
    if ((now >= retArray[0] && now <= retArray[1])) {
        currDrawType = DRAW_INST;
    }
    //if (now > retArray[1]) {
    //    currDrawType = DRAW_INST;
    //}
    retArray = GetDateRange("DEC_CONFIG", "DMP_FCFS_PERIOD", year)

    if ((now >= retArray[0] && now <= retArray[1])) {
        currDrawType = DRAW_FCFS;
    }
    //if (now > retArray[1]) {
    //    currDrawType = DRAW_FCFS;
    //}

    return currDrawType;
}
function isNull(pTestValue, pNewValue) {
    if (pTestValue == null || pTestValue == "")
        return pNewValue;
    else
        return pTestValue;
}

function getActiveHoldings(peopleSequenceNumber, year) {
    var availableActiveItems = new Array();
    var validActiveholdingsArray = getActiveholdingsFilterArray();

    var CC = new contactObj(null);
    CC.refSeqNumber = peopleSequenceNumber;
    var allContactCaps = CC.getCaps("Licenses/*/*/*");

    for (var ccp in allContactCaps) {
        var itemCapId = allContactCaps[ccp];
        var itemCap = aa.cap.getCap(itemCapId).getOutput();
        appTypeResult = itemCap.getCapType();
        appTypeString = appTypeResult.toString();
        if (exists(appTypeString, validActiveholdingsArray)) {
            var newActiveTag = new ACTIVE_ITEM(itemCapId, itemCap, appTypeString);
            if (newActiveTag.isActive(year)) {
                availableActiveItems.push(newActiveTag);
            }
        }
    }
    return availableActiveItems;
}

function ACTIVE_ITEM(itemCapId, itemCap, recordType) {
    this.itemCapId = itemCapId;
    this.itemCap = itemCap;
    this.CapStatus = null;
    this.RecordType = recordType;
    this.altId = null;
    this.itemAinfo = new Array();

    this.LicenseYear = null;
    this.Description = null;
    this.ItemCode = null;
    this.TagType = null;
    this.fileDate = null;
    this.FromDate = null;
    this.DT_FromDate = null;
    this.ExpDate = null;
    this.ToDate = null;
    this.DT_ToDate = null;
    this.PrintConsignedLines = '';
    this.IsTag = function () {
        var ata = this.RecordType.split("/");
        return (ata[1] == "Tag");
    }
    this.isActive = function (year) {
        var isactive = (this.CapStatus == "Approved" || this.CapStatus == "Active");
        if (arguments.length > 0) {
            if (isactive && year != "undefined") {
                isactive = isactive && (year == this.LicenseYear);
            }
        }
        if (isactive && this.DT_ToDate != null) {
            isactive = isactive && (dateDiff(new Date(), this.DT_ToDate) > 0);
        }

        return isactive;
    }
    this.isActiveForUpgrade = function (year) {
        var isactive = (this.CapStatus == "Approved" || this.CapStatus == "Active" || this.CapStatus == "Reported");
        if (arguments.length > 0) {
            if (isactive && year != "undefined") {
                isactive = isactive && (year == this.LicenseYear);
            }
        }
        if (isactive && this.DT_ToDate != null) {
            isactive = isactive && (dateDiff(new Date(), this.DT_ToDate) > 0);
        }

        return isactive;
    }
    this.isOpenToday = function () {
        var isOpenToday = false;
        if (this.DT_FromDate != null) {
            var toDateStr = jsDateToMMDDYYYY(new Date())
            isOpenToday = (dateDiff(new Date(toDateStr), this.DT_FromDate) == 0);
        }
        return isOpenToday;
    }
    this.toString = function () {
        var retStr = '';
        retStr += this.itemCapId;
        retStr += " : ";
        retStr += this.altId
        retStr += " - ";
        retStr += this.Description;
        retStr += "(";
        retStr += this.CapStatus;
        retStr += ", ";
        retStr += this.RecordType;
        retStr += ", Year: " + this.LicenseYear;
        retStr += ", IsTag: " + this.IsTag();
        retStr += ", ItemCode: " + this.ItemCode;
        retStr += ", TagType: " + this.TagType;
        retStr += ", FromDate: " + this.FromDate;
        retStr += ", ToDate: " + this.ToDate;
        retStr += ")";
        return retStr;
    }
    this.setActiveItems = function () {
        try {
            if (this.itemCapId != null) {
                this.CapStatus = this.itemCap.getCapStatus();
                this.Description = this.itemCap.getSpecialText();
                this.altId = this.itemCapId.getCustomID();

                loadAppSpecific(this.itemAinfo, this.itemCapId);
                this.LicenseYear = this.itemAinfo["Year"];
                this.ItemCode = this.itemAinfo["Item Code"];
                this.TagType = this.itemAinfo["Tag Type"];
                if (this.RecordType == AA54_TAG_PRIV_PANEL) {
                    this.PrintConsignedLines = this.itemAinfo["PrintConsignedLines"];
                }

                if (this.RecordType == AA24_NONRESIDENT_1_DAY_FISHING || this.RecordType == AA03_ONE_DAY_FISHING_LICENSE) {
                    this.fileDate = this.itemCap.getFileDate();
                    this.DT_FromDate = isNull(this.itemAinfo["Effective Date"], '') == '' ? new Date(this.fileDate.getMonth() + "/" + this.fileDate.getDayOfMonth() + "/" + this.fileDate.getYear()) : convertDate(this.itemAinfo["Effective Date"]);
                    this.FromDate = jsDateToMMDDYYYY(this.DT_FromDate);
                } else if (this.RecordType == AA25_NONRESIDENT_7_DAY_FISHING || this.RecordType == AA26_SEVEN_DAY_FISHING_LICENSE) {
                    this.fileDate = this.itemCap.getFileDate();
                    this.DT_FromDate = isNull(this.itemAinfo["Effective Date"], '') == '' ? new Date(this.fileDate.getMonth() + "/" + this.fileDate.getDayOfMonth() + "/" + this.fileDate.getYear()) : convertDate(this.itemAinfo["Effective Date"]);
                    this.FromDate = jsDateToMMDDYYYY(this.DT_FromDate);
                } else {
                    this.fileDate = this.itemCap.getFileDate();
                    this.DT_FromDate = new Date(this.fileDate.getMonth() + "/" + this.fileDate.getDayOfMonth() + "/" + this.fileDate.getYear());
                    this.FromDate = jsDateToMMDDYYYY(this.DT_FromDate);
                }

                this.ExpDate = this.getExpDate(this.itemCapId);
                this.DT_ToDate = null;
                if (this.ExpDate != null) {
                    this.DT_ToDate = new Date(this.ExpDate.getMonth() + "/" + this.ExpDate.getDayOfMonth() + "/" + this.ExpDate.getYear());
                    this.ToDate = jsDateToMMDDYYYY(this.DT_ToDate);
                }
            }
        }
        catch (err) {
            logDebug("Exception in setActiveItems:" + err.message);
        }
    }
    this.getExpDate = function () {
        var expDate = null;
        try {
            var searchCapId = this.itemCapId;
            if (arguments.length == 1) searchCapId = arguments[0];

            if (searchCapId != null) {
                var b1ExpResult = aa.expiration.getLicensesByCapID(searchCapId)
                if (b1ExpResult.getSuccess()) {
                    var b1Exp = b1ExpResult.getOutput();
                    expDate = b1Exp.getExpDate();
                }
                else {
                    logDebug("**WARNING: Getting B1Expiration Object for Cap.  Reason is: " + b1ExpResult.getErrorType() + ":" + b1ExpResult.getErrorMessage());
                }
            }
        }
        catch (err) {
            logDebug("**WARNING: Exception in getExpDate:" + err.message);
        }
        return expDate;
    }
    this.setActiveItems();
}
function exists(eVal, eArray) {
    for (ii in eArray)
        if (eArray[ii] == eVal) return true;
    return false;
}

