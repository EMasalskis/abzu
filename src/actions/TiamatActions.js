/*
 *  Licensed under the EUPL, Version 1.2 or – as soon they will be approved by
the European Commission - subsequent versions of the EUPL (the "Licence");
You may not use this work except in compliance with the Licence.
You may obtain a copy of the Licence at:

  https://joinup.ec.europa.eu/software/page/eupl

Unless required by applicable law or agreed to in writing, software
distributed under the Licence is distributed on an "AS IS" basis,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the Licence for the specific language governing permissions and
limitations under the Licence. */

import {
  mutateDeleteQuay,
  mutateDeleteStopPlace,
  mutateMergeQuays,
  mutateMergeStopPlaces,
  mutateMoveQuaysToStop,
  mutateMoveQuaysToNewStop,
  mutateParentStopPlace,
  mutateAddToMultiModalStopPlace,
  mutateCreateMultiModalStopPlace,
  removeStopPlaceFromParent,
  mutateStopPlace,
  updateChildOfParentStop,
  mutateRemoveTag,
  mutateCreateTag,
  mutateTerminateStopPlace,
  mutateGroupOfStopPlaces,
  deleteGroupMutation,
  deleteParkingMutation,
} from "../graphql/Tiamat/mutations";
import {
  allVersionsOfStopPlace,
  allEntities,
  stopPlaceBBQuery,
  getMergeInfoStopPlace,
  topopGraphicalPlacesQuery,
  findStop,
  getStopPlacesById,
  getPolygons as getPolygonsQuery,
  getTagsQuery,
  findTagByNameQuery,
  getStopById,
  getQueryTopographicPlaces,
  getTagsByNameQuery,
  getGroupOfStopPlaceQuery,
  findTariffones,
  stopPlaceAndPathLinkByVersion,
  findStopForReport as findStopForReportQuery,
  getParkingForMultipleStopPlaces as getParkingForMultipleStopPlacesQuery,
  topopGraphicalPlacesReportQuery,
  neighbourStopPlaceQuays,
} from "../graphql/Tiamat/queries";
import mapToMutationVariables from "../modelUtils/mapToQueryVariables";

import { createApolloErrorThunk, createApolloThunk } from ".";
import * as types from "./Types";
import uuid from "uuid/v4";

const getContext = async (auth) => {
  const context = {
    headers: {
      "X-Correlation-Id": uuid(),
    },
  };

  if (auth.isAuthenticated) {
    context.headers["Authorization"] = `Bearer ${await auth.getAccessToken()}`;
  }

  return context;
};

const handleQuery = (client, payload) => (dispatch) =>
  client.query(payload).then((result) => {
    dispatch(
      createApolloThunk(
        types.APOLLO_QUERY_RESULT,
        result,
        payload.query,
        payload.variables
      )
    );
    return result;
  });

const handleMutation = (client, payload) => (dispatch) =>
  client
    .mutate(payload)
    .then((result) => {
      if (result?.errors?.length > 0) {
        dispatch(
          createApolloErrorThunk(
            types.APOLLO_MUTATION_ERROR,
            result.errors,
            payload.mutation,
            payload.variables
          )
        );
      } else {
        dispatch(
          createApolloThunk(
            types.APOLLO_MUTATION_RESULT,
            result,
            payload.mutation,
            payload.variables
          )
        );
        return result;
      }
    })
    .catch((e) => {
      dispatch(
        createApolloErrorThunk(
          types.APOLLO_MUTATION_ERROR,
          e,
          payload.mutation,
          payload.variables
        )
      );
      throw e;
    });

export const findTagByName = (name) => async (dispatch, getState) =>
  handleQuery(getState().user.client, {
    query: findTagByNameQuery,
    fetchPolicy: "network-only",
    variables: {
      name,
    },
    context: await getContext(getState().roles.auth),
  })(dispatch);

export const addTag = (idReference, name, comment) => async (
  dispatch,
  getState
) =>
  handleMutation(getState().user.client, {
    mutation: mutateCreateTag,
    fetchPolicy: "no-cache",
    variables: {
      idReference,
      name,
      comment,
    },
    context: await getContext(getState().roles.auth),
  })(dispatch);

export const getStopPlaceById = (id) => async (dispatch, getState) =>
  handleQuery(getState().user.client, {
    query: getStopById,
    fetchPolicy: "network-only",
    variables: {
      id,
    },
    context: await getContext(getState().roles.auth),
  })(dispatch);

export const getAddStopPlaceInfo = (stopPlaceIds) => async (
  dispatch,
  getState
) =>
  handleQuery(getState().user.client, {
    query: getStopPlacesById(stopPlaceIds),
    fetchPolicy: "network-only",
    context: await getContext(getState().roles.auth),
  })(dispatch);

export const saveStopPlaceBasedOnType = (stopPlace, userInput) => async (
  dispatch,
  getState
) => {
  const { isChildOfParent } = stopPlace;

  if (!isChildOfParent) {
    const variables = mapToMutationVariables.mapStopToVariables(
      stopPlace,
      userInput
    );

    return new Promise(async (resolve, reject) => {
      handleMutation(getState().user.client, {
        mutation: mutateStopPlace,
        variables,
        fetchPolicy: "no-cache",
        context: await getContext(getState().roles.auth),
      })(dispatch)
        .then((result) => {
          if (result.data.mutateStopPlace[0].id) {
            resolve(result.data.mutateStopPlace[0].id);
          } else {
            reject("Id not returned");
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  } else {
    return new Promise(async (resolve, reject) => {
      const variables = mapToMutationVariables.mapChildStopToVariables(
        stopPlace,
        userInput
      );

      handleMutation(getState().user.client, {
        mutation: updateChildOfParentStop,
        variables,
        fetchPolicy: "network-only",
        context: await getContext(getState().roles.auth),
      })(dispatch)
        .then((result) => {
          resolve(stopPlace.id);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
};

export const saveParentStopPlace = (variables) => async (dispatch, getState) =>
  handleMutation(getState().user.client, {
    mutation: mutateParentStopPlace,
    variables,
    fetchPolicy: "no-cache",
    context: await getContext(getState().roles.auth),
  })(dispatch);

export const removeStopPlaceFromMultiModalStop = (
  parentSiteRef,
  stopPlaceId
) => async (dispatch, getState) =>
  handleMutation(getState().user.client, {
    mutation: removeStopPlaceFromParent,
    variables: {
      stopPlaceId,
      parentSiteRef,
    },
    fetchPolicy: "network-only",
    context: await getContext(getState().roles.auth),
  })(dispatch);

export const deleteQuay = (variables) => async (dispatch, getState) => {
  handleMutation(getState().user.client, {
    mutation: mutateDeleteQuay,
    variables,
    fetchPolicy: "no-cache",
    context: await getContext(getState().roles.auth),
  })(dispatch);
};

export const deleteStopPlace = (stopPlaceId) => async (dispatch, getState) =>
  handleMutation(getState().user.client, {
    mutation: mutateDeleteStopPlace,
    variables: {
      stopPlaceId,
    },
    fetchPolicy: "no-cache",
    context: await getContext(getState().roles.auth),
  })(dispatch);

export const terminateStop = (
  stopPlaceId,
  shouldTerminatePermanently,
  versionComment,
  toDate
) => async (dispatch, getState) =>
  handleMutation(getState().user.client, {
    mutation: mutateTerminateStopPlace,
    variables: {
      stopPlaceId,
      versionComment,
      toDate,
      modificationEnumeration: shouldTerminatePermanently ? "delete" : null,
    },
    context: await getContext(getState().roles.auth),
  })(dispatch);

export const addToMultiModalStopPlace = (parentSiteRef, stopPlaceIds) => async (
  dispatch,
  getState
) =>
  handleMutation(getState().user.client, {
    mutation: mutateAddToMultiModalStopPlace,
    variables: {
      stopPlaceIds,
      parentSiteRef,
    },
    fetchPolicy: "no-cache",
    context: await getContext(getState().roles.auth),
  })(dispatch);

export const createParentStopPlace = ({
  name,
  description,
  versionComment,
  coordinates,
  validBetween,
  stopPlaceIds,
}) => async (dispatch, getState) =>
  handleMutation(getState().user.client, {
    mutation: mutateCreateMultiModalStopPlace,
    variables: {
      name,
      description,
      versionComment,
      coordinates,
      validBetween,
      stopPlaceIds,
    },
    fetchPolicy: "no-cache",
    context: await getContext(getState().roles.auth),
  })(dispatch);

export const mutateGroupOfStopPlace = (variables) => async (
  dispatch,
  getState
) =>
  new Promise(async (resolve, reject) => {
    handleMutation(getState().user.client, {
      mutation: mutateGroupOfStopPlaces,
      variables,
      fetchPolicy: "no-cache",
      context: await getContext(getState().roles.auth),
    })(dispatch)
      .then(({ data }) => {
        const id = data["mutateGroupOfStopPlaces"]
          ? data["mutateGroupOfStopPlaces"].id
          : null;
        resolve(id);
      })
      .catch((err) => {
        reject(null);
      });
  });

export const getStopPlaceVersions = (stopPlaceId) => async (
  dispatch,
  getState
) =>
  handleQuery(getState().user.client, {
    query: allVersionsOfStopPlace,
    variables: {
      id: stopPlaceId,
    },
    fetchPolicy: "network-only",
    context: await getContext(getState().roles.auth),
  })(dispatch);

export const mergeQuays = (
  stopPlaceId,
  fromQuayId,
  toQuayId,
  versionComment
) => async (dispatch, getState) =>
  handleMutation(getState().user.client, {
    mutation: mutateMergeQuays,
    variables: {
      stopPlaceId,
      fromQuayId,
      toQuayId,
      versionComment,
    },
    fetchPolicy: "no-cache",
    context: await getContext(getState().roles.auth),
  })(dispatch);

export const getStopPlaceWithAll = (id) => async (dispatch, getState) =>
  handleQuery(getState().user.client, {
    query: allEntities,
    variables: {
      id,
    },
    fetchPolicy: "network-only",
  })(dispatch);

export const mergeAllQuaysFromStop = (
  fromStopPlaceId,
  toStopPlaceId,
  fromVersionComment,
  toVersionComment
) => async (dispatch, getState) =>
  handleMutation(getState().user.client, {
    mutation: mutateMergeStopPlaces,
    variables: {
      fromStopPlaceId,
      toStopPlaceId,
      fromVersionComment,
      toVersionComment,
    },
    fetchPolicy: "no-cache",
    context: await getContext(getState().roles.auth),
  })(dispatch);

export const moveQuaysToStop = (
  toStopPlaceId,
  quayId,
  fromVersionComment,
  toVersionComment
) => async (dispatch, getState) =>
  handleMutation(getState().user.client, {
    mutation: mutateMoveQuaysToStop,
    variables: {
      toStopPlaceId,
      quayId,
      fromVersionComment,
      toVersionComment,
    },
    fetchPolicy: "no-cache",
    context: await getContext(getState().roles.auth),
  })(dispatch);

export const moveQuaysToNewStop = (
  quayIds,
  fromVersionComment,
  toVersionComment
) => async (dispatch, getState) =>
  handleMutation(getState().user.client, {
    mutation: mutateMoveQuaysToNewStop,
    variables: {
      quayIds,
      fromVersionComment,
      toVersionComment,
    },
    fetchPolicy: "no-cache",
    context: await getContext(getState().roles.auth),
  })(dispatch);

export const getNeighbourStops = (
  ignoreStopPlaceId,
  bounds,
  includeExpired
) => async (dispatch, getState) =>
  handleQuery(getState().user.client, {
    fetchPolicy: "network-only",
    query: stopPlaceBBQuery,
    variables: {
      includeExpired: includeExpired,
      ignoreStopPlaceId,
      latMin: bounds.getSouthWest().lat,
      latMax: bounds.getNorthEast().lat,
      lonMin: bounds.getSouthWest().lng,
      lonMax: bounds.getNorthEast().lng,
    },
    context: await getContext(getState().roles.auth),
  })(dispatch);

export const getPolygons = (ids) => async (dispatch, getState) =>
  handleQuery(getState().user.client, {
    fetchPolicy: "network-only",
    query: getPolygonsQuery(ids),
    context: await getContext(getState().roles.auth),
  })(dispatch);

export const getTopographicPlaces = (ids) => async (dispatch, getState) =>
  handleQuery(getState().user.client, {
    fetchPolicy: "network-only",
    query: getQueryTopographicPlaces(ids),
    context: await getContext(getState().roles.auth),
  })(dispatch);

export const getMergeInfoForStops = (stopPlaceId) => async (
  dispatch,
  getState
) =>
  handleQuery(getState().user.client, {
    fetchPolicy: "network-only",
    query: getMergeInfoStopPlace,
    variables: {
      stopPlaceId,
    },
    context: await getContext(getState().roles.auth),
  })(dispatch);

export const findEntitiesWithFilters = (
  query,
  stopPlaceType,
  chips,
  showFutureAndExpired
) => async (dispatch, getState) => {
  const municipalityReference = chips
    .filter((topos) => topos.type === "municipality")
    .map((topos) => topos.value);
  const countyReference = chips
    .filter((topos) => topos.type === "county")
    .map((topos) => topos.value);
  const countryReference = chips
    .filter((topos) => topos.type === "country")
    .map((topos) => topos.value);

  return handleQuery(getState().user.client, {
    query: findStop,
    fetchPolicy: "network-only",
    variables: {
      query,
      stopPlaceType,
      municipalityReference: municipalityReference,
      countyReference: countyReference,
      countryReference: countryReference,
      pointInTime: showFutureAndExpired ? null : new Date().toISOString(),
      versionValidity: showFutureAndExpired ? "MAX_VERSION" : null,
    },
    context: await getContext(getState().roles.auth),
  })(dispatch);
};

export const findTopographicalPlace = (query) => async (dispatch, getState) =>
  handleQuery(getState().user.client, {
    query: topopGraphicalPlacesQuery,
    fetchPolicy: "network-only",
    variables: {
      query,
    },
    context: await getContext(getState().roles.auth),
  })(dispatch);

export const getTags = (idReference) => async (dispatch, getState) =>
  handleQuery(getState().user.client, {
    query: getTagsQuery,
    fetchPolicy: "network-only",
    variables: {
      idReference,
    },
    context: await getContext(getState().roles.auth),
  })(dispatch);

export const getTagsByName = (name) => async (dispatch, getState) =>
  handleQuery(getState().user.client, {
    query: getTagsByNameQuery,
    fetchPolicy: "network-only",
    variables: {
      name,
    },
    context: await getContext(getState().roles.auth),
  })(dispatch);

export const removeTag = (name, idReference) => async (dispatch, getState) =>
  handleMutation(getState().user.client, {
    mutation: mutateRemoveTag,
    variables: {
      name,
      idReference,
    },
    fetchPolicy: "no-cache",
    context: await getContext(getState().roles.auth),
  })(dispatch);

export const getGroupOfStopPlacesById = (id) => async (dispatch, getState) =>
  handleQuery(getState().user.client, {
    query: getGroupOfStopPlaceQuery,
    variables: {
      id,
    },
    fetchPolicy: "network-only",
    context: await getContext(getState().roles.auth),
  })(dispatch);

export const deleteGroupOfStopPlaces = (id) => async (dispatch, getState) =>
  handleMutation(getState().user.client, {
    mutation: deleteGroupMutation,
    variables: {
      id,
    },
    fetchPolicy: "no-cache",
    context: await getContext(getState().roles.auth),
  })(dispatch);

export const getTariffZones = (query) => async (dispatch, getState) =>
  handleQuery(getState().user.client, {
    query: findTariffones,
    variables: {
      query,
    },
    fetchPolicy: "network-only",
    context: await getContext(getState().roles.auth),
  })(dispatch);

export const deleteParking = (id) => async (dispatch, getState) =>
  handleMutation(getState.user.client, {
    mutation: deleteParkingMutation,
    variables: {
      id,
    },
    fetchPolicy: "no-cache",
    context: await getContext(getState().roles.auth),
  })(dispatch);

export const getStopPlaceAndPathLinkByVersion = (id, version) => async (
  dispatch,
  getState
) =>
  handleQuery(getState().user.client, {
    fetchPolicy: "network-only",
    query: stopPlaceAndPathLinkByVersion,
    variables: {
      id,
      version,
    },
    context: await getContext(getState().roles.auth),
  })(dispatch);

export const findStopForReport = (queryVariables) => async (
  dispatch,
  getState
) =>
  handleQuery(getState().user.client, {
    query: findStopForReportQuery,
    fetchPolicy: "network-only",
    variables: queryVariables,
    context: await getContext(getState().roles.auth),
  })(dispatch);

export const getParkingForMultipleStopPlaces = (stopPlaceIds) => async (
  dispatch,
  getState
) =>
  handleQuery(getState().user.client, {
    query: getParkingForMultipleStopPlacesQuery(stopPlaceIds),
    fetchPolicy: "network-only",
    context: await getContext(getState().roles.auth),
  })(dispatch);

export const topographicalPlaceSearch = (searchText) => async (
  dispatch,
  getState
) =>
  handleQuery(getState().user.client, {
    query: topopGraphicalPlacesReportQuery,
    fetchPolicy: "network-only",
    variables: {
      query: searchText,
    },
    context: await getContext(getState().roles.auth),
  })(dispatch);

export const getNeighbourStopPlaceQuays = (id) => async (dispatch, getState) =>
  handleQuery(getState().user.client, {
    fetchPolicy: "network-only",
    query: neighbourStopPlaceQuays,
    variables: {
      id: id,
    },
    context: await getContext(getState().roles.auth),
  })(dispatch);