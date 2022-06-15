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

import { useSelector } from "react-redux";
import { useCallback, useEffect, useMemo, useState } from "react";
import EditStopMap from "../components/Map/EditStopMap";
import EditStopGeneral from "../components/EditStopPage/EditStopGeneral";
import EditParentGeneral from "../components/EditParentStopPage/EditParentGeneral";
import InformationBanner from "../components/EditStopPage/InformationBanner";
import { useIntl } from "react-intl";
import InformationManager from "../singletons/InformationManager";
import "../styles/main.css";
import { UserActions } from "../actions";
import { getIn } from "../utils";
import NewElementsBox from "../components/EditStopPage/NewElementsBox";
import NewStopPlaceInfo from "../components/EditStopPage/NewStopPlaceInfo";
import LoadingPage from "./LoadingPage";
import { getStopPlaceWithAll } from "../actions/TiamatActions";
import { Button, Dialog, DialogActions, DialogContent } from "@mui/material";
import { useAppDispatch } from "../store/hooks";
import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../store/store";

const selectProps = createSelector(
  (state: RootState) => state,
  (state) => ({
    isCreatingPolylines: state.stopPlace.isCreatingPolylines,
    stopPlace: state.stopPlace.current || state.stopPlace.newStop,
    disabled:
      (state.stopPlace.current &&
        state.stopPlace.current.permanentlyTerminated) ||
      !getIn(state.roles, ["allowanceInfo", "canEdit"], false),
    newStopCreated: state.user.newStopCreated,
    originalStopPlace: state.stopPlace.originalCurrent,
    stopPlaceLoading: state.stopPlace.loading,
  })
);

export const StopPlace = () => {
  const {
    isCreatingPolylines,
    stopPlace,
    originalStopPlace,
    disabled,
    newStopCreated,
    stopPlaceLoading,
  } = useSelector(selectProps);

  const [error, setError] = useState({
    showErrorDialog: false,
    resourceNotFound: false,
  });

  const dispatch = useAppDispatch();
  const { formatMessage } = useIntl();

  const handleCloseErrorDialog = useCallback(() => {
    dispatch(UserActions.navigateTo("/", ""));
    setError((prev) => ({
      ...prev,
      showErrorDialog: false,
    }));
  }, []);

  const handleOnClickPathLinkInfo = useCallback(() => {
    new InformationManager().setShouldPathLinkBeDisplayed(false);
  }, []);

  useEffect(() => {
    let title = "";

    if (stopPlace) {
      if (stopPlace.isNewStop) {
        title = formatMessage({ id: "_title_new_stop" });
      } else {
        if (originalStopPlace.name) {
          title = originalStopPlace.name;
        }
        if (stopPlace.topographicPlace) {
          title += ", " + stopPlace.topographicPlace;
        }
      }
    }
    document.title = title;
  }, [stopPlace]);

  const idFromPath = useMemo(() => {
    return window.location.pathname
      .substring(window.location.pathname.lastIndexOf("/"))
      .replace("/", "");
  }, [window.location.pathname]);

  useEffect(() => {
    if (idFromPath === "new" && !stopPlace) {
      dispatch(UserActions.navigateTo("/", ""));
    }

    if (idFromPath && idFromPath.length && idFromPath && idFromPath !== "new") {
      dispatch(getStopPlaceWithAll(idFromPath))
        .then((response) => {
          if (!response.data.stopPlace.length) {
            setError({
              showErrorDialog: true,
              resourceNotFound: true,
            });
          }
        })
        .catch((err) => {
          console.error("error fetching stopPlace", err);
          setError({
            showErrorDialog: true,
            resourceNotFound: false,
          });
        });
    }
  }, [idFromPath, stopPlace]);

  const shouldDisplayMessage =
    isCreatingPolylines &&
    new InformationManager().getShouldPathLinkBeDisplayed();

  return (
    <div>
      <Dialog
        open={error.showErrorDialog}
        onClose={() => {
          setError((prev) => ({
            ...prev,
            showErrorDialog: false,
          }));
        }}
      >
        <DialogContent>
          {error.resourceNotFound
            ? formatMessage({ id: "error_stopPlace_404" }) + idFromPath
            : formatMessage({ id: "error_unable_to_load_stop" })}
        </DialogContent>
        <DialogActions>
          <Button
            variant="text"
            onClick={handleCloseErrorDialog}
            color="secondary"
          >
            {formatMessage({ id: "cancel" })}
          </Button>
        </DialogActions>
      </Dialog>
      <NewStopPlaceInfo
        open={newStopCreated.open}
        stopPlaceId={newStopCreated.stopPlaceId}
      />
      {shouldDisplayMessage && (
        <InformationBanner
          title={formatMessage({ id: `pathLinks.title` })}
          ingress={formatMessage({ id: `pathLinks.ingress` })}
          body={formatMessage({ id: `pathLinks.body` })}
          closeButtonTitle={formatMessage({
            id: `pathLinks.closeButtonTitle`,
          })}
          handleOnClick={handleOnClickPathLinkInfo}
        />
      )}

      {!stopPlace && !error.showErrorDialog && (
        <>
          <LoadingPage />
          <EditStopMap disabled />
        </>
      )}
      {stopPlaceLoading && <LoadingPage />}
      {stopPlace && !stopPlace.isParent && (
        <div>
          <NewElementsBox disabled={disabled || stopPlaceLoading} />
          <EditStopGeneral disabled={disabled || stopPlaceLoading} />
          <EditStopMap disabled={disabled || stopPlaceLoading} />
        </div>
      )}
      {stopPlace && stopPlace.isParent && (
        <div>
          <EditParentGeneral disabled={disabled || stopPlaceLoading} />
          <EditStopMap disabled={disabled || stopPlaceLoading} />
        </div>
      )}
    </div>
  );
};