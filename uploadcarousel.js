import { uploadMedia } from 'actions/mediaActions'
import { updateMedia } from 'actions/composeObActions'

/**
*
* Actions for saving the blob to media id reference for photo carousel
*
*
*/

export const uploadCarouselSymbols = {
  addPhoto: Symbol('ADD_PHOTO'),
  replacePhotos: Symbol('REPLACE_PHOTOS'),
  clear: Symbol('CLEAR')
}

/** takes an array of media Id's and turns them into
* @param {array} media array of media id's
* @return {array} array of objects
*/

export const createPhotoSet = (media) => {
  const photos = media.map(media_id => {
    const localPhotoId = Math.floor(Math.random()*90000) + 10000;

    return { id: localPhotoId, media_id }
  })

  return {
    type: uploadCarouselSymbols.replacePhotos,
    photos
  }
}

/**
  @param {object} photoObj { id: string, media_id: string, blob:string }
*/
export const addPhoto = (photoObj) => {
  return {
    type: uploadCarouselSymbols.addPhoto,
    photoObj
  };
}

/**
  adds photo to upload carousel reducer
  adds photo to storage api
  @param {object} photoFormData
  @param {object} blob
  @param {string} id
*/
export const addAndUploadPhoto = (photoFormData, blob, id) => {
  return (dispatch, getState) => {
    dispatch(addPhoto({blob, id}))
    dispatch(uploadMedia(photoFormData)).then(res => {
      const { uploadCarouselPhotos } = getState();
      //if the user has not deleted their photo yet
      if (uploadCarouselPhotos.photos.find(photoObj => photoObj.id === id)) {
        dispatch(addPhotoToComposeOb(res._id));
        const update = {
          id: id,
          blob: blob,
          media_id: res._id
        }
        dispatch(findAndUpdatePhoto(id, update))
      }
    })
  }
}

/**
  updates the photo in the upload carousel reducer
  @param {string} id
  @param {object} update
*/
export const findAndUpdatePhoto = (id, update) => {
  return (dispatch, getState) => {
    const { uploadCarouselPhotos } = getState();
    const photos = uploadCarouselPhotos.photos

    const nextPhotos = photos.map(photo => {
      if (photo.id !== id) return photo;
      return update;
    })

    dispatch({
      type: uploadCarouselSymbols.replacePhotos,
      photos: nextPhotos
    })
  }
}

/**
  adds the photo to the compose ob reducer
  @param {string} media_id
*/
export const addPhotoToComposeOb = (media_id) => {
  return (dispatch, getState) => {
    const {composeOb} = getState();

    const nextMedia = composeOb.media.concat([media_id])
    console.log(nextMedia)
    dispatch(updateMedia(nextMedia))
  }
}

/**
  removes photo from photo array in store
  @param {string} id
*/
export const removePhoto = (id) => {
  return (dispatch, getState) => {
    const { composeOb, uploadCarouselPhotos } = getState();
    const removedPhotoObj = uploadCarouselPhotos.photos.find(photoObj => photoObj.id === id)

    const nextPhotos = uploadCarouselPhotos.photos.filter(photoObj =>
      {
        return photoObj.id !== removedPhotoObj.id
      })

    const nextMedia = composeOb.media.filter(media_id =>
      {
        return media_id !== removedPhotoObj.media_id
      })

    dispatch(updateMedia(nextMedia))
    dispatch({
      type: uploadCarouselSymbols.replacePhotos,
      photos: nextPhotos
    })
  }
}

export const clear = () => {
  return {
    type: uploadCarouselSymbols.clear,
  }
}
