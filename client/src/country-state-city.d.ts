declare module 'react-country-state-city' {
  export interface Country {
    isoCode: string;
    name: string;
    flag: string;
  }

  export interface State {
    isoCode: string;
    name: string;
    countryCode: string;
  }

  export interface City {
    name: string;
    countryCode: string;
    stateCode: string;
  }

  export const Country: {
    getAllCountries: () => Country[];
  };

  export const State: {
    getStatesOfCountry: (countryIsoCode: string) => State[];
  };

  export const City: {
    getCitiesOfState: (countryIsoCode: string, stateIsoCode: string) => City[];
  };
}
