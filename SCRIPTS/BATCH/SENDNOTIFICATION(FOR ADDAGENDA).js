//Description:
//This sample script is used to send notification to all contacts in records.
//For certain types of records they may need to send out a notification to all contacts on the records 
//for a given meeting notifying that something is happening;
//Event Name: AddAgendaAfter
//-----------------------------------------------------------------------------------------------------------

//For AddAgendaAfter, get cap id by "CapIDList" parameter
var capIDModels= aa.env.getValue("CapIDList");

var capType = 'Building/Facilities Permit Program/Annual Registration/Master Permit';

for(var i = 0; i < capIDModels.size(); i++)
{
	var capIDModel = capIDModels.get(i);
	var capTypeModel = getCapTypeModel(capIDModel);
	if(!(capTypeModel && capType.equals(capTypeModel.toString())))
	{
		aa.print(capTypeModel.toString());
		continue;
	}
	var contactResult = aa.people.getCapContactByCapID(capIDModel);
	var contacts = contactResult.getOutput();
	if(contacts != null && contacts.length > 0)
	{
		for (var j=0; j < contacts.length; j++)
		{
			var contact = contacts[j].getCapContactModel();
			var contactSeqNumber = contact.getRefContactNumber();
			var email = contact.getEmail();
			if(email != null)
			{
				var subject = 'Meeting Agendas Change';
				var content = 'Hello! Meetingagendas have changed.';
				var from = '';
				var cc = '';
				var doc = aa.util.newArrayList();
				var result = aa.meeting.sendEmail(subject, content, from, email, cc, doc);
				if(result.getSuccess())
				{
					aa.print("To:"+result.getOutput());
				}
			}
		}
	}
	else
	{
	    aa.print("Record: " + capIDModel +"has not contact.");
	}
	
}
aa.env.setValue("ScriptReturnMessage","Send Email Successfully.");

function getCapTypeModel(capIDModel)
{
	var capTypeResult = aa.cap.getCapTypeModelByCapID(capIDModel);
	if(capTypeResult.getSuccess())
	{
		return capTypeResult.getOutput();
	}
	return null;
}
