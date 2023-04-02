
const getPhoto = function() : photoType {
  return {
      url: '',
      mediaType: '',
      base64: false,
      attachFromUrl: function(url: string, mediaType: string){
          this.url = url;
          this.mediaType = mediaType;
          this.base64 = false;
      },
      embedFromFile: function(fileLocation: string) {
        var fs   = require('fs');
        var path = require('path');
        this.mediaType = path.extname(fileLocation).toUpperCase().replace(/\./g, "");
        var imgData = fs.readFileSync(fileLocation);
        this.url = imgData.toString('base64');
        this.base64 = true;
      },
      embedFromString: function(base64String: string, mediaType: string) {
        this.mediaType = mediaType;
        this.url = base64String;
        this.base64 = true;
      }
  };
}

function getAddress() : addressType{
  return {
      label: '',
      street: '',
      city: '',
      stateProvince: '',
      postalCode: '',
      countryRegion: ''
  };
}

let majorVersion : number = 3;
function getMajorVersion(version = '3.0') {
  majorVersion = parseInt(version?.split('.')?.[0] || version);
  return version;
}

export const autoUUID = function (){
	let uuidBase62 = require('uuid-base62');
	let uuid = uuidBase62.v4();
	let originalUuid = uuidBase62.decode(uuid);
	return originalUuid;
}

export let vCardObj = {
  majorVersion: 0,
  version: getMajorVersion,
  uid: '',
  birthday: '',
  cellPhone: '',
  pagerPhone: '',
  email: '',
  workEmail: '',
  firstName: '',
  middleName: '',
  lastName: '',
  formattedName: '',
  gender: '',
  homeAddress: getAddress(),
  homePhone: '',
  homeFax: '',
  otherPhone: '',
  namePrefix: '',
  nameSuffix: '',
  nickname: '',
  note: '',
  organization: '',
  isOrganization: false,
  role: '',
  socialUrls: {},
  source: '',
  title: '',
  url: '',
  workUrl: '',
  workAddress: getAddress(),
  workPhone: '',
  workFax: '',
  anniversary: '',
  otherEmail: '',
  photo: getPhoto(),
  logo: getPhoto(),
}


function san(value: any) {
  value = '' + value;
  return value.replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
}
let newLine = '\r\n';

function getFormattedPhoto(photoType: string, url: string, mediaType: string, base64: boolean) {
  let params;
  if (majorVersion >= 4) {
    params = base64 ? ';ENCODING=b;MEDIATYPE=image/' : ';MEDIATYPE=image/';
  } else if (majorVersion === 3) {
    params = base64 ? ';ENCODING=b;TYPE=' : ';TYPE=';
  } else {
    params = base64 ? ';ENCODING=BASE64;' : ';';
  }
  return photoType + params + mediaType + ':' + san(url) + newLine;
}

function formatDate(date: Date) {
  return date.getFullYear() + ('0' + (date.getMonth()+1)).slice(-2) + ('0' + date.getDate()).slice(-2);
}


export const generateVCFString = function (vCard : Partial<vcardType>, isQR: boolean = false) {
  let formattedVCardString = '';
  vCard.version = getMajorVersion(vCard.version); 
  vCard.majorVersion = majorVersion; 
  
  formattedVCardString += 'BEGIN:VCARD' + newLine;
  if(!isQR) formattedVCardString += 'VERSION:' + vCard.version + newLine;

  const encodingPrefix = majorVersion >= 4 ? '' : ';CHARSET=UTF-8';

  let formattedName = vCard.formattedName || '';
  if (!formattedName) {
    formattedName = '';
    [vCard.firstName, vCard.middleName, vCard.lastName]
      .forEach(name => {
        formattedName += (formattedName && name) ? ` ${name}` : name;
      });
  }
  vCard.formattedName = formattedName;
  formattedVCardString += 'FN' + encodingPrefix + ':' + san(formattedName) + newLine;
  
  formattedVCardString += (!isQR) ? 'N' + encodingPrefix + ':' +
    san(vCard.lastName) + ';' +
    san(vCard.firstName) + ';' +
    san(vCard.middleName) + ';' +
    san(vCard.namePrefix) + ';' +
    san(vCard.nameSuffix) + newLine : '';

  formattedVCardString += (vCard.nickname && majorVersion >= 3) ? 'NICKNAME' + encodingPrefix + ':' + san(vCard.nickname) + newLine : '';
  formattedVCardString += vCard.gender ? 'GENDER:' + san(vCard.gender) + newLine : '';
  formattedVCardString += vCard.uid ? 'UID' + encodingPrefix + ':' + san(vCard.uid) + newLine : '';
  formattedVCardString += vCard.birthday ? 'BDAY:' + formatDate(vCard.birthday) + newLine : '';
  formattedVCardString += vCard.anniversary ? 'ANNIVERSARY:' + formatDate(vCard.anniversary) + newLine : '';

  function prepareEmailString({email: emailsList, type}: {email: stringMultipel, type: string}){
    if(!emailsList) return '';
    let formatedEmailsString = '';
    if(!Array.isArray(emailsList)){
      emailsList = [emailsList];
    }
    emailsList.forEach( (address: string) => {
        if (majorVersion >= 4) {
          formatedEmailsString += 'EMAIL' + encodingPrefix + `;type=${type}:` + san(address) + newLine;
        } else if (majorVersion >= 3 && majorVersion < 4) {
          formatedEmailsString += 'EMAIL' + encodingPrefix + `;type=${type},INTERNET:` + san(address) + newLine;
        } else {
          formatedEmailsString += 'EMAIL' + encodingPrefix + `;${type};INTERNET:` + san(address) + newLine;
        }
      }
    );
    return formatedEmailsString;
  }

  [
    { email: vCard.email, type: "HOME" },
    { email: vCard.workEmail, type: "WORK" },
    { email: vCard.otherEmail, type: "OTHER" },
  ].forEach(email=>{
    if(email) formattedVCardString += prepareEmailString(email);
  });

  formattedVCardString += vCard?.logo?.url ? getFormattedPhoto('LOGO', vCard.logo.url, vCard.logo.mediaType, vCard.logo.base64) : '';
  formattedVCardString += vCard?.photo?.url ? getFormattedPhoto('PHOTO', vCard.photo.url, vCard.photo.mediaType, vCard.photo.base64) : '';
  

  function preparePhoneString({phones: phonesList, type1, type2}: {phones: stringMultipel | undefined, type1: string, type2: string}){
    if(!phonesList) return '';
    let formatedPhonesString = '';
    if(!Array.isArray(phonesList)){
      phonesList = [phonesList];
    }
    phonesList.forEach((number) => {
        if (majorVersion >= 4) {
          formatedPhonesString += `TEL;VALUE=uri;TYPE="${type1}":tel:` + san(number) + newLine;
        } else {
          formatedPhonesString += `TEL;TYPE=${type2}:` + san(number) + newLine;
        }
      }
    );
    return formatedPhonesString;
  }

  [
    { phones: vCard.cellPhone, type1: "voice,cell", type2: "CELL" },
    { phones: vCard.pagerPhone, type1: "pager,cell", type2: "PAGER" },
    { phones: vCard.homePhone, type1: "voice,home", type2: "HOME,VOICE" },
    { phones: vCard.workPhone, type1: "voice,work", type2: "WORK,VOICE" },
    { phones: vCard.homeFax, type1: "fax,home", type2: "HOME,FAX" },
    { phones: vCard.workFax, type1: "fax,work", type2: "WORK,FAX" },
    { phones: vCard.otherPhone, type1: "voice,other", type2: "OTHER" },
  ].forEach(phone =>{
    if(phone) formattedVCardString += preparePhoneString(phone);
    }
  );


  function getFormattedAddress(address: addressType, addressKey: string) {
    let params = '';
    if(!address || Object.values(address).some(val=>!val)) return '';
    if (majorVersion >= 4) {
      params = 'ADR' + encodingPrefix + ';TYPE=' + addressKey +
        (address.label ? ';LABEL="' + san(address.label) + '"' : '') + ':;;' +
        san(address.street) + ';' +
        san(address.city) + ';' +
        san(address.stateProvince) + ';' +
        san(address.postalCode) + ';' +
        san(address.countryRegion) + newLine;
    } else {
      if (address.label) {
        params = 'LABEL' + encodingPrefix + ';TYPE=' + addressKey + ':' + san(address.label) + newLine;
      }
      params += 'ADR' + encodingPrefix + ';TYPE=' + addressKey + ':;;' +
        san(address.street) + ';' +
        san(address.city) + ';' +
        san(address.stateProvince) + ';' +
        san(address.postalCode) + ';' +
        san(address.countryRegion) + newLine;
    }
    return params;
  }

  [
    { details: vCard.homeAddress, addressKey: 'HOME' },
    { details: vCard.workAddress, addressKey: 'WORK' }
  ].forEach(
    function(elm) {
      if(elm.details) formattedVCardString += getFormattedAddress(elm.details, elm.addressKey);
    }
  );

  formattedVCardString += vCard.title ? 'TITLE' + encodingPrefix + ':' + san(vCard.title) + newLine : '';
  formattedVCardString += vCard.role ? 'ROLE' + encodingPrefix + ':' + san(vCard.role) + newLine : '';
  formattedVCardString += vCard.organization ? 'ORG' + encodingPrefix + ':' + san(vCard.organization) + newLine : '';
  formattedVCardString += vCard.url ? 'URL' + encodingPrefix + ':' + san(vCard.url) + newLine : '';
  formattedVCardString += vCard.workUrl ? 'URL;type=WORK' + encodingPrefix + ':' + san(vCard.workUrl) + newLine : '';
  formattedVCardString += vCard.note ? 'NOTE' + encodingPrefix + ':' + san(vCard.note) + newLine : '';

  if(vCard.socialUrls){
    let key: string;
    for (key in vCard.socialUrls) {
      const val = vCard.socialUrls[key];
      formattedVCardString += val ? 'X-SOCIALPROFILE' + encodingPrefix + ';TYPE=' + key + ':' + san(val) + newLine : '';
    }
  }

  formattedVCardString += vCard.source ? 'SOURCE' + encodingPrefix + ':' + san(vCard.source) + newLine : '';
  formattedVCardString += (!isQR) ? 'REV:' + (new Date()).toISOString() + newLine : '';
  formattedVCardString += vCard.isOrganization ? 'X-ABShowAs:COMPANY' + newLine : '';
  formattedVCardString += (!isQR) ? 'END:VCARD' + newLine : '';

  // console.log({formattedVCardString});
  return formattedVCardString;
}

export const generateVCFFile = (vCardObj: vcardType, filename = null) => {
  const fs = require('fs');
  const formatedString : string = generateVCFString(vCardObj);
  fs.writeFileSync(filename ?? `${vCardObj.formattedName}.vcf`, formatedString, { encoding: 'utf8' });
  console.log(`VCF file for ${vCardObj.formattedName} Generated`);
}

export const generateFullVCFQR = (vCardObj : Partial<vcardType>, fileName = null, options = {}) => {
  const QRCode = require('qrcode');
  const isQR = true;
  const formatedString = generateVCFString(vCardObj, isQR);
  QRCode.toFile(fileName ?? `${vCardObj.formattedName}.jpg`, formatedString, options, function (err : string) {
    if (err) throw err;
    console.log(`QR Code for ${vCardObj.formattedName} Generated\n`, formatedString);
  });
}

export const generateQR = (vCardObj: vcardType, fileName = null, options = {}) => {
  const QRvCardObj : Partial<vcardType> = {
    version: vCardObj.version,
    formattedName: vCardObj.formattedName,
    cellPhone: vCardObj.cellPhone,
    url: vCardObj.url || vCardObj.workUrl,
    organization: vCardObj.organization,
    title: vCardObj.title || vCardObj.role,
  }
  return generateFullVCFQR(QRvCardObj, fileName, options);
}
