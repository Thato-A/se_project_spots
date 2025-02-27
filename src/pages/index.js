import "./index.css";
import {
  enableValidation,
  settings,
  resetValidation,
  disableButton,
} from "../script/validation";
import Api from "../utils/Api.js";
import { setButtonText } from "../utils/helpers.js";

import logoSrc from "../images/logo.svg";
import avatarSrc from "../images/avatar-image.jpeg";
import pencilSrc from "../images/pencil.svg";
import iconSrc from "../images/plus-icon.svg";
import pencilLightSrc from "../images/pencil-light.svg";

const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "e85bb70e-faf4-4bea-9119-eddd44253922",
    "Content-Type": "application/json",
  },
});

api
  .getAppInfo()
  .then(([cards, userInfo]) => {
    cards.forEach((item) => {
      const cardElement = getCardElement(item);
      cardsList.append(cardElement);
    });
    avatarImage.src = userInfo.avatar;
    profileName.textContent = userInfo.name;
    profileDescription.textContent = userInfo.about;
  })
  .catch((err) => {
    console.error(err);
  });

const logoImage = document.getElementById("image-logo");
logoImage.src = logoSrc;

const avatarImage = document.getElementById("image-avatar");
avatarImage.src = avatarSrc;

const pencilImage = document.getElementById("image-pencil");
pencilImage.src = pencilSrc;

const iconImage = document.getElementById("image-icon");
iconImage.src = iconSrc;

const pencilLightImage = document.getElementById("image-pencil-light");
pencilLightImage.src = pencilLightSrc;

//Profile elements
const profileEditButton = document.querySelector(".profile__edit-btn");
const avatarModalBtn = document.querySelector(".profile__avatar-btn");
const cardModalBtn = document.querySelector(".profile__add-btn");
const profileName = document.querySelector(".profile__name");
const profileDescription = document.querySelector(".profile__description");

//edit profile
const editModal = document.querySelector("#edit-modal");
const editFormElement = editModal.querySelector(".modal__form");
const closeButtons = [...document.querySelectorAll(".modal__close-btn")];
const editModalNameInput = editModal.querySelector("#profile-name-input");
const editModalDescriptionInput = editModal.querySelector(
  "#profile-description-input"
);
const editSubmitBtn = editModal.querySelector(".modal__submit-btn");

//avatar elements
const avatarModal = document.querySelector("#avatar-modal");
const avatarForm = avatarModal.querySelector(".modal__form");
const avatarSubmitBtn = avatarModal.querySelector(".modal__submit-btn");
const avatarLinkInput = avatarModal.querySelector("#profile-avatar-input");

//delete form elements
const deleteModal = document.querySelector("#delete-modal");
const deleteForm = deleteModal.querySelector(".modal__form");
const deleteSubmitBtn = deleteModal.querySelector(
  ".modal__submit-btn_type_delete"
);
const cancelBtn = deleteModal.querySelector(".modal__submit-btn_type_cancel");

//card elements
const cardModal = document.querySelector("#add-card-modal");
const cardForm = cardModal.querySelector(".modal__form");
const cardSubmitBtn = cardModal.querySelector(".modal__submit-btn");
const cardNameInput = cardModal.querySelector("#add-card-name-input");
const cardLinkInput = cardModal.querySelector("#add-card-link-input");

const cardTemplate = document.querySelector("#card-template");
const cardsList = document.querySelector(".cards__list");

//preview elements
const previewModal = document.querySelector("#preview-modal");
const previewModalImageEl = previewModal.querySelector(".modal__image");
const previewModalCaptionEl = previewModal.querySelector(".modal__caption");
const modalElements = document.querySelectorAll(".modal");

let selectedCard, selectedCardId;

function handleDeleteSubmit(evt) {
  evt.preventDefault();
  setButtonText(deleteSubmitBtn, true, "Delete", "Deleting...");
  api
    .deleteCard(selectedCardId)
    .then(() => {
      selectedCard.remove();
      closeModal(deleteModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(deleteSubmitBtn, false, "Delete", "Deleting...");
    });
}

function handleDeleteCard(cardElement, cardId) {
  selectedCard = cardElement;
  selectedCardId = cardId;
  openModal(deleteModal);
}

function handleLike(evt, id) {
  console.log(id);
  const isLiked = evt.target.classList.contains("card__like-btn_liked");
  console.log(isLiked);
  api
    .changeLikeStatus(id, isLiked)
    .then(() => {
      evt.target.classList.toggle("card__like-btn_liked");
    })
    .catch(console.error);
}

function getCardElement(data) {
  const cardElement = cardTemplate.content
    .querySelector(".card")
    .cloneNode(true);

  const cardNameEl = cardElement.querySelector(".card__title");
  const cardImageEl = cardElement.querySelector(".card__image");
  const cardLikeBtn = cardElement.querySelector(".card__like-btn");
  const cardDeleteBtn = cardElement.querySelector(".card__delete-btn");

  cardNameEl.textContent = data.name;
  cardImageEl.src = data.link;
  cardImageEl.alt = data.name;

  cardImageEl.addEventListener("click", () => {
    openModal(previewModal);
    previewModalCaptionEl.textContent = data.name;
    previewModalImageEl.src = data.link;
    previewModalImageEl.alt = data.name;
  });

  if (data.isLiked) {
    cardLikeBtn.classList.add("card__like-btn_liked");
  }

  cardLikeBtn.addEventListener("click", (evt) => handleLike(evt, data._id));

  cardDeleteBtn.addEventListener("click", () =>
    handleDeleteCard(cardElement, data._id)
  );

  return cardElement;
}

function openModal(modal) {
  modal.classList.add("modal_opened");
  document.addEventListener("keyup", closeModalOnEsc);
}

function closeModal(modal) {
  modal.classList.remove("modal_opened");
  document.removeEventListener("keyup", closeModalOnEsc);
}

function closeModalOnEsc(evt) {
  if (evt.key === "Escape") {
    const activeModal = document.querySelector(".modal_opened");
    closeModal(activeModal);
  }
}

function handleEditFormSubmit(evt) {
  evt.preventDefault();
  setButtonText(editSubmitBtn, true, "Save", "Saving...");
  api
    .editUserInfo({
      name: editModalNameInput.value,
      about: editModalDescriptionInput.value,
    })
    .then((data) => {
      profileName.textContent = data.name;
      profileDescription.textContent = data.about;
      closeModal(editModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(editSubmitBtn, false, "Save", "Saving...");
    });
}

function handleAddCardSubmit(evt) {
  evt.preventDefault();
  setButtonText(cardSubmitBtn, true, "Save", "Saving...");
  const inputValues = {
    name: cardNameInput.value,
    link: cardLinkInput.value,
  };
  api
    .addNewCard(inputValues)
    .then((data) => {
      const cardElement = getCardElement(data);
      cardsList.prepend(cardElement);
      evt.target.reset();
      closeModal(cardModal);
      disableButton(cardSubmitBtn, settings);
      console.log(cardSubmitBtn);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(cardSubmitBtn, false, "Save", "Saving...");
    });
}

function handleAvatarSubmit(evt) {
  evt.preventDefault();
  setButtonText(avatarSubmitBtn, true, "Save", "Saving...");

  const avatarInput = document.getElementById("profile-avatar-input");

  api
    .editAvatarInfo(avatarInput.value)
    .then((data) => {
      document.getElementById("image-avatar").src = data.avatar;
      closeModal(avatarModal);
      avatarLinkInput.value = "";
      disableButton(avatarSubmitBtn, settings);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(avatarSubmitBtn, true, "Save", "Saving...");
    });
}

profileEditButton.addEventListener("click", () => {
  editModalNameInput.value = profileName.textContent;
  editModalDescriptionInput.value = profileDescription.textContent;
  disableButton(editSubmitBtn, settings);
  openModal(editModal);
});

editFormElement.addEventListener("submit", handleEditFormSubmit);

cardModalBtn.addEventListener("click", () => {
  openModal(cardModal);
});

cardForm.addEventListener("submit", handleAddCardSubmit);

avatarModalBtn.addEventListener("click", () => {
  openModal(avatarModal);
});

avatarForm.addEventListener("submit", handleAvatarSubmit);

deleteForm.addEventListener("submit", handleDeleteSubmit);

cancelBtn.addEventListener("click", () => {
  closeModal(deleteModal);
});

closeButtons.forEach((button) => {
  const popup = button.closest(".modal");
  button.addEventListener("click", () => closeModal(popup));
});

modalElements.forEach((modalElements) => {
  modalElements.addEventListener("click", (evt) => {
    if (evt.target.classList.contains("modal")) {
      closeModal(modalElements);
    }
  });
});

enableValidation(settings);
