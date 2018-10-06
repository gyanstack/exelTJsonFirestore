import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { AngularFirestore } from 'angularfire2/firestore';
import * as firebase from 'firebase';
import * as _ from 'lodash';
import { map } from 'rxjs/operators';

@Injectable()
export class XltofirestoreService {

  private stored: boolean;
  private department: string;
  ref = firebase.storage().ref('excel');

  constructor(private afs: AngularFirestore, private http: Http) { }

  uploadFile(file, departmentName: string) {
    let self = this;
    self.department = departmentName;
    return new Promise((resolve) => {
      this.ref.put(file).then(function (snapshot) {
        snapshot.ref.getDownloadURL().then(
          downloadurl => {
            firebase.database().ref('excelimport').child('newexcel').set({
              thaturl: downloadurl,
              department: departmentName
            }).then(() => {
              console.log('uploaded');
            })
          }
        )
      });
      setTimeout(() => {
        self.firestorethis().then(() => {
          resolve();
        })
      }, 60000);
    })
  }

  firestorethis(departmentSelected = '') {
    let self = this;
    if (departmentSelected)
    self.department = departmentSelected;
    let options = {};
    return new Promise((resolve) => {
      firebase.storage().ref(this.department + '_jsonfile.json').getDownloadURL().then((url) => {
        this.http.get(url, options)
          .subscribe((data) => {
            self.storethis(data).then(() => {
              resolve();
            })
          }, function (error) {
            if (!self.stored)
              setTimeout(() => {
                self.firestorethis().then(() => {
                  resolve();
                })
              }, 60000);
            else
              console.log(error);
          })
      }, function (error) {
        if (!self.stored)
          setTimeout(() => {
            self.firestorethis().then(() => {
              resolve();
            })
          }, 60000);
        else
          console.log(error);
      })
    })
  }

  storethis(somejson) {
    return new Promise((resolve) => {
      _.map(somejson, (element, i) => {
        // _.keys(element).map(elementkey => {
        if (i == '_body') {
          this.stored = true;
          let obj = JSON.parse(element);
          // obj = _.uniqBy(obj, 'city');
          obj = _.compact(obj);
          obj.forEach((element, j) => {
            if (element.srNo) {
              // element = _.pick(element, ['state', 'district', 'city']);
              element = _.omit(element, '');
              this.afs.collection('myGuestHouses').doc(this.department + '_' + j).set(element);
            }
          });
        }
        // })
      })
      resolve();
    })
  }
}
