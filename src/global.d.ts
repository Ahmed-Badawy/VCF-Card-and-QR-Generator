type stringMultipel = string | string[] | undefined;

type addressType = {
  label: string,
  street: string,
  city: string,
  stateProvince: string,
  postalCode: string,
  countryRegion: string,
}

type photoType = {
  url: string,
  mediaType: string,
  base64: boolean,
  attachFromUrl: (a: string, b: string) => void,
  embedFromFile: (a: string) => void,
  embedFromString: (a: string, b: string) => void,
}

interface socialUrlsInterface {
  [key: string]: string
}

type vcardType = {
  majorVersion: number,
  version: string,
  uid: string,
  birthday: Date,
  cellPhone: stringMultipel,
  pagerPhone: stringMultipel,
  email: stringMultipel,
  workEmail: stringMultipel,
  firstName: string,
  middleName: string,
  lastName: string,
  formattedName: string,
  gender: string,
  homeAddress: addressType,
  homePhone: stringMultipel,
  otherPhone: string,
  homeFax: stringMultipel,
  namePrefix: string,
  nameSuffix: string,
  nickname: string,
  note: string,
  organization: string,
  isOrganization: boolean,
  role: string,
  socialUrls: socialUrlsInterface[],
  source: string,
  title: string,
  url: string,
  workUrl: string,
  workAddress: addressType,
  workPhone: stringMultipel,
  workFax: stringMultipel,
  anniversary: Date,
  otherEmail: string,
  photo: photoType,
  logo: photoType,
}

type vcardForQRType = {
  version: string,
  formattedName: string,
  cellPhone: stringMultipel,
  url: string,
  organization: string,
  title: string,
} 