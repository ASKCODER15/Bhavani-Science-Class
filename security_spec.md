# Security Specification: Bhavani Science Classes

## 1. Data Invariants

1. **Teacher Access Control (RBAC)**: Only users whose email exists in `approved_teachers` or matches the verified instructor bootstrap list can perform write operations (creating/updating students, batches, test results, fee records, lectures, timetables, notices).
2. **Student Isolation**: Students can read only their own Student record, Test Results, and Fee Records. They cannot read other students' sensitive financial or performance data.
3. **Immutability of System Fields**: Students have read-only access and zero write access to test results and fees.
4. **Lecture Access Scoping**: Lectures belong to specific batches (or 'all'). Only authenticated students of that batch and teachers can access them.
5. **Notice Broadcast**: Notices targeted to 'all' or to the student's assigned batch are readable by enrolled students; writes are restricted exclusively to teachers.
6. **No Client Privilege Escalation**: Students cannot add themselves to `approved_teachers` or elevate roles.

## 2. The "Dirty Dozen" Payloads (Rejected by Security Rules)

1. **Student Modifying Marks**: Student attempts to update `totalMarks` from 120 to 290 in `test_results/{id}`. (Status: DENIED - write requires isTeacher).
2. **Student Altering Fee Ledger**: Student attempts to change `pendingFee` from 15000 to 0 in `fee_records/{id}`. (Status: DENIED - write requires isTeacher).
3. **Student Viewing Peer Fee Record**: Student A attempts to read `fee_records/student_b_id`. (Status: DENIED - read requires isOwner or isTeacher).
4. **Student Viewing Peer Test Result**: Student A attempts to query `test_results` without filtering by their own `studentId`. (Status: DENIED - query enforcer requires resource.data.studentId == request.auth.uid).
5. **Unauthorized User Uploading Lecture**: Unapproved user attempts to post a video to `/lectures`. (Status: DENIED - write requires isTeacher).
6. **Privilege Escalation on Teachers List**: Non-teacher adds their own email to `/approved_teachers/myemail@gmail.com`. (Status: DENIED - write requires isTeacher).
7. **Cross-Batch Lecture Scrape**: Student in NEET batch attempts to read restricted lecture assigned strictly to JEE batch. (Status: DENIED - batch scoping).
8. **Tampering with Student Roll/Batch**: Student attempts to update their own `batchId` or `rollNo`. (Status: DENIED - student collection writes restricted to teachers).
9. **Fake Notice Injection**: Unauthorized user tries to broadcast a fake holiday cancellation notice. (Status: DENIED - write requires isTeacher).
10. **Orphaned Lecture Record**: Write attempt with invalid or empty YouTube URL. (Status: DENIED - schema validation).
11. **Negative Fee Amount Injection**: Setting fee amounts to negative numbers. (Status: DENIED - validation constraints).
12. **Unauthenticated Public Read on Fees**: Anonymous or unauthenticated request reading financial records. (Status: DENIED - requires authentication).
