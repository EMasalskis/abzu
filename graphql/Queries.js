import gql from 'graphql-tag';
import Fragments from './Fragments';


export const neighbourStopPlaceQuays = gql`
  query neighbourStopPlaceQuays($id: String!) {
      stopPlace(id: $id) {
          id 
          ...on StopPlace {
              quays {
                  id
                  version
                  geometry {
                      coordinates
                  }
                  compassBearing
                  publicCode
                  privateCode {
                      value
                  }
              }
          }
      }
  }
`;

export const stopPlaceBBQuery = gql`
    query stopPlaceBBox($ignoreStopPlaceId: String, $lonMin: BigDecimal!, $lonMax: BigDecimal!, $latMin: BigDecimal!, $latMax: BigDecimal!, $includeExpired: Boolean) {
        stopPlaceBBox(ignoreStopPlaceId: $ignoreStopPlaceId, latMin: $latMin, latMax: $latMax, lonMin: $lonMin, lonMax: $lonMax, size: 500, includeExpired: $includeExpired) {
            id
            name {
                value
            }
            geometry {
                coordinates
            }
            validBetween {
                fromDate
                toDate
            }
            stopPlaceType
            submode
            topographicPlace {
                name {
                    value
                }
                topographicPlaceType
            }
        }
    },
`;

export const allEntities = gql`
    query stopPlaceAndPathLink($id: String!) {
        __typename
        pathLink(stopPlaceId: $id) {
            ...VerbosePathLink
        },
        stopPlace(id: $id) {
            ...VerboseStopPlace
            ...VerboseParentStopPlace
        }
        parking: parking(stopPlaceId: $id) {
            ...VerboseParking
        },
        versions:
            stopPlace(id: $id, allVersions: true, size: 100) {
                    id
                    validBetween {
                        fromDate
                        toDate
                    }
                    name {
                        value
                        lang
                    }
                    version
                    versionComment
                    changedBy
                }
        },
    ${Fragments.stopPlace.verbose},
    ${Fragments.parentStopPlace.verbose},
    ${Fragments.pathLink.verbose},
    ${Fragments.parking.verbose},
`;

export const findStop = gql`
    query findStop($query: String, $municipalityReference: [String], $stopPlaceType: [StopPlaceType], $countyReference: [String]) {
        stopPlace(query: $query, municipalityReference: $municipalityReference, stopPlaceType: $stopPlaceType, countyReference: $countyReference, size: 7) {
            id
            __typename
            keyValues {
                key
                values
            }
            name {
                value
            }
            geometry {
                coordinates
            }
            validBetween {
                fromDate
                toDate
            }
            accessibilityAssessment {
                limitations {
                    wheelchairAccess
                }
            }
            topographicPlace {
                name {
                    value
                }
                topographicPlaceType
                parentTopographicPlace {
                    name {
                        value
                    }
                }
            }
            ... on StopPlace {
              stopPlaceType
              submode
              transportMode
              quays {
                  id
                  importedId
              }
            }
           ... on ParentStopPlace {
               geometry {
                   coordinates 
                   type 
               }
               children {
                   name {
                       value
                   }
                   id
                   importedId
                   stopPlaceType 
                   transportMode 
                   submode
               }
           }
        }
    },
`;

export const findStopForReport = gql`
    query findStopForReport($query: String, $importedId: String, $municipalityReference: [String], $stopPlaceType: [StopPlaceType], $countyReference: [String], $withoutLocationOnly: Boolean!) {

        stopPlace(query: $query, importedId: $importedId, municipalityReference: $municipalityReference, stopPlaceType: $stopPlaceType, countyReference: $countyReference, withoutLocationOnly: $withoutLocationOnly, size: 300) {
            id
            keyValues {
                key
                values
            }
            name {
                value
            }
            geometry {
                coordinates
            }
            accessibilityAssessment {
                limitations {
                    wheelchairAccess
                    stepFreeAccess
                }
            }
            placeEquipments {
                shelterEquipment {
                    id
                }
                waitingRoomEquipment {
                    id
                }
                sanitaryEquipment {
                    id
                }
                generalSign {
                    signContentType
                    privateCode {
                        value
                    }
                }
            }
            topographicPlace {
                name {
                    value
                }
                topographicPlaceType
                parentTopographicPlace {
                    name {
                        value
                    }
                }
            }
            ... on StopPlace {
              stopPlaceType
              submode
              quays {
                  id
                  keyValues {
                      key
                      values
                  }
                  name {
                      value
                  }
                  geometry {
                      coordinates
                  }
                  placeEquipments {
                      shelterEquipment {
                          id
                      }
                      waitingRoomEquipment {
                          id
                      }
                      sanitaryEquipment {
                          id
                      }
                      generalSign {
                          signContentType
                          privateCode {
                              value
                          }
                      }
                  }
                  privateCode {
                      value
                  }
                  publicCode
              }
           }
        }
    },
`;

export const allVersionsOfStopPlace = gql`
    query stopPlaceAllVersions($id: String!) {
        versions:
        stopPlace(id: $id, allVersions: true, size: 100) {
            id
            validBetween {
                fromDate
                toDate
            }
            name {
                value
                lang
            }
            changedBy
            version
            versionComment
        }
    },
`;

export const stopPlaceAndPathLinkByVersion = gql`
    query stopPlaceAndPathLink($id: String!, $version: Int) {
        pathLink(stopPlaceId: $id) {
            ...VerbosePathLink
        },
        stopPlace(id: $id, version: $version) {
            ...VerboseStopPlace
        }
        parking: parking(stopPlaceId: $id) {
            ...VerboseParking
        }
        versions:
        stopPlace(id: $id, allVersions: true, size: 100) {
            id
            validBetween {
                fromDate
                toDate
            }
            name {
                value
                lang
            }
            version
            versionComment
            changedBy
        }
    },
    ${Fragments.stopPlace.verbose},
    ${Fragments.pathLink.verbose},
    ${Fragments.parking.verbose}
`;

export const topopGraphicalPlacesQuery = gql`
    query TopopGraphicalPlaces($query: String!) {
        topographicPlace(query: $query) {
            id
            name {
                value
            }
            topographicPlaceType
            parentTopographicPlace {
                name {
                    value
                }
            }
        }
    }
`;

export const topopGraphicalPlacesReportQuery = gql`
    query TopopGraphicalPlacesForReport($query: String!) {
        topographicPlace(query: $query) {
            id
            name {
                value
            }
            topographicPlaceType
            parentTopographicPlace {
                name {
                    value
                }
            }
        }
    }
`;

export const getMergeInfoStopPlace = gql`
    query MergeInfoStopPlace($stopPlaceId: String!) {
        stopPlace(id: $stopPlaceId) {
            ...on StopPlace {
                quays {
                    id
                    privateCode {
                        value
                    }
                    compassBearing
                    publicCode
                }
            }
        }
    }
`;

export const getParkingForMultipleStopPlaces = stopPlaceIds => {
  const stopPlaces = stopPlaceIds.map(id => ({
    id,
    alias: id.replace('NSR:StopPlace:', 'StopPlace')
  }));

  let queryContent = '';

  stopPlaces.forEach(stopPlace => {
    queryContent += `
        ${stopPlace.alias}: parking(stopPlaceId: "${stopPlace.id}") {
            id
            parkingVehicleTypes
        }
    `;
  });

  return gql`
    query {
        ${queryContent}
    }
  `;
};

export const getPolygons = ids => {
  let queryContent = '';

  ids.forEach(id => {
    let alias = id.replace(':', '').replace(':', '');

    queryContent += `
        ${alias}: topographicPlace(id: "${id}") {
           id
            polygon {
                coordinates
            }
        }
    `;
  });

  return gql`
      query {
          ${queryContent}
      }
  `;
};
