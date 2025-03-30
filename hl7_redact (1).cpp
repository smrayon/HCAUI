#include <iostream>
#include <string>
#include <vector>
#include <algorithm>
#include <fstream>
using namespace std;


int main(void) {
    // declare variables
    string filename = "source.hl7", line, seg, message = "", date, lineCopy;
    string first, last, birthdate, address, ccode, homephone, workphone, ssn, field, mrn, alt, acc;
    string attend, refer, consult, admit, other; // doctors
    ifstream inFile(filename); // only does shorter
    ofstream outFile("messages_redacted.txt");
    vector<string> messages;
    size_t acuteIndex, firstIndex, lastIndex;
    
    while (getline(inFile, line)) {
        seg = line.substr(0, 3);
        if (seg == "MSH") {
            if (message != "") messages.push_back(message);
            message = line + "\n";
        }
        else { // line doesn't start with MSH
            if (seg != "PID" && seg != "PV1" && seg != "OBX") {
                // nothing happens
            }
            // Check EVN5? Probably not
            else if (seg == "PID") {
                size_t i = 1; // line starts at 1
                lineCopy = line;
                line = seg;
                for (auto it = lineCopy.find("|"); it != string::npos; it = lineCopy.find("|", it+1), i++) {
                    field = lineCopy.substr(it+1, lineCopy.find("|", it+1)-it-1);
                    if (i == 3) {           // 3: acc num 1
                        mrn = field;
                        line += "|*****";
                    } else if (i == 4) {    // 4: alternate ID
                        alt = field;
                        line += "|*****";
                    } else if (i == 5) {    // 5: patient name
                        acuteIndex = field.find("^");
                        first = field.substr(0, field.find("^"));
                        last = field.substr(acuteIndex+1, field.find("^", acuteIndex+1) - acuteIndex-1);
                        line += "|*****";
                    } else if (i == 7) {    // 7: birth date, set age to 90
                        birthdate = field;
                        line += "|*****";
                    } else if (i == 11) {   // 11: address
                        address = field;
                        line += "|*****";
                    }
                    else if (i == 12) {     // 12: county code
                        ccode = field;
                        line += "|*****";
                    } else if (i == 13) {   // 13: home phone
                        homephone = field;
                        line += "|*****";
                    }
                    else if (i == 14) {     // 14: work phone
                        workphone = field;
                        line += "|*****";
                    } else if (i == 18) {   // 18: acc num 2
                        acc = field;
                        line += "|*****";
                    } else if (i == 19) {   // 19: SSN
                        ssn = field;
                        line += "|*****";
                    } else {
                        line += ("|" + field);
                    }
                }

            } else if (seg == "PV1") {
                size_t i = 1; // line starts at 1
                lineCopy = line;
                line = seg;
                for (auto it = lineCopy.find("|"); it != string::npos; it = lineCopy.find("|", it+1), i++) {
                    field = lineCopy.substr(it+1, lineCopy.find("|", it+1)-it-1);
                    if (i == 7) {           // 7: attending doctor
                        attend = field;
                        line += "|*****";
                    } else if (i == 8) {    // 8: referring doctor
                        refer = field;
                        line += "|*****";
                    } else if (i == 9) {    // 9: consulting doctor
                        consult = field;
                        line += "|*****";
                    } else if (i == 17) {   // 17: admitting doctor 
                        admit = field;
                        line += "|*****";
                    } else if (i == 52) {   // 52: other healthcare provider 
                        other = field;
                        line += "|*****";
                    } else {
                        line += ("|" + field);
                    }
                }
    
            } else { // OBX search for first and last names
                size_t i = 1; // line starts at 1
                lineCopy = line;
                line = seg;
                for (auto it = lineCopy.find("|"); it != string::npos; it = lineCopy.find("|", it+1), i++) {
                    field = lineCopy.substr(it+1, lineCopy.find("|", it+1)-it-1);
                    if (i == 5) {
                        lastIndex = field.find(last);
                        if (string::npos != lastIndex) {
                            field.replace(lastIndex, last.size(), "*****");
                        }
                        firstIndex = field.find(first);
                        if (string::npos != firstIndex) {
                            field.replace(firstIndex, first.size(), "*****");
                        }
                    }
                    line += ("|" + field);
                }
            }
            message.append(line + "\n");
        }
    }
    
    for (size_t i = 0; i < messages.size(); i++) {
        outFile << messages.at(i);
    }
    inFile.close();
    outFile.close();
    // operator ID EVN[5]
    // ages over 90 set to year 1935
    // email addresses: find @ and replace every word in that?
    return 0;
}