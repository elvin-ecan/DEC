// Enter your script here...
var capID= aa.cap.getCapID("12CAP","00000","003MU").getOutput();
var capDetail= aa.cap.getCapDetail(capID).getOutput();
capDetail.setShortNotes("White 1");
// rollback
aa.batchJob.beginTransaction(10);
aa.cap.editCapDetail(capDetail.getCapDetailModel());
aa.print(capDetail.getShortNotes());
aa.batchJob.rollbackTransaction();
// commit
aa.batchJob.beginTransaction(10);
capDetail.setShortNotes("White 2");
aa.cap.editCapDetail(capDetail.getCapDetailModel());
aa.batchJob.commitTransaction();
