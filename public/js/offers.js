const selectedOfferIds = [];
let selectedOfferId = null;

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Bootstrap modals
  const successModal = new bootstrap.Modal(
    document.getElementById("successModal")
  );
  const errorModal = new bootstrap.Modal(document.getElementById("errorModal"));

  // Check user role to determine if selection circles should be enabled for expired offers
  let userRole = null;
  getUserRole().then((role) => {
    userRole = role;
    if (userRole === "admin" || userRole === "cashier") {
      $("#admin-actions").removeClass("d-none").addClass("d-block");
    }
  });

  fetch("/api/v1/offers")
    .then((response) => response.json())
    .then((data) => {
      const offerList = document.getElementById("offer-list");

      // Function to format the date and time
      function formatDateTime(dateTime) {
        const date = new Date(dateTime);
        const formattedDate = date.toLocaleDateString("ar-EG", {
          month: "long",
          day: "numeric",
        });
        const formattedTime = date.toLocaleTimeString("ar-EG", {
          hour: "2-digit",
          minute: "2-digit",
        });
        return { formattedDate, formattedTime };
      }

      function formatTimeRemaining(timeRemaining) {
        const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
          (timeRemaining % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
        return `${days} يوم ${hours} ساعة ${minutes} دقيقة ${seconds} ثانية`;
      }

      function updateRemainingTime(offer, offerCardId) {
        const now = new Date();
        const endDate = new Date(offer.endDate);
        const timeRemaining = Math.max(endDate - now, 0);
        const timeRemainingElement = document.querySelector(
          `#${offerCardId} .time-remaining`
        );
        const countdownBar = document.querySelector(
          `#${offerCardId} .countdown-bar`
        );
        const offerCard = document.querySelector(`#${offerCardId}`);
        const expiredOverlay = document.querySelector(
          `#${offerCardId} .expired-overlay`
        );

        if (timeRemaining <= 0) {
          // Offer has expired
          timeRemainingElement.textContent = "انتهى العرض";
          if (countdownBar) {
            countdownBar.style.width = "100%";
            countdownBar.setAttribute("aria-valuenow", 100);
          }
          if (offerCard) {
            offerCard.classList.add("expired");
          }
          if (expiredOverlay) {
            expiredOverlay.classList.remove("d-none"); // Ensure overlay is visible
          }
          return null;
        } else {
          // Offer is still active
          const formattedTimeRemaining = formatTimeRemaining(timeRemaining);
          timeRemainingElement.textContent = formattedTimeRemaining;
          if (expiredOverlay) {
            expiredOverlay.classList.add("d-none"); // Ensure overlay is hidden
          }
          return formattedTimeRemaining;
        }
      }

      if (data.data.data.length > 0) {
        data.data.data.forEach((offer) => {
          const offerCardId = `offer-card-${offer._id}`;
          const formattedStartDate = formatDateTime(
            offer.startDate
          ).formattedDate;
          const formattedEndDate = formatDateTime(offer.endDate).formattedDate;
          const formattedStartTime = formatDateTime(
            offer.startDate
          ).formattedTime;
          const formattedEndTime = formatDateTime(offer.endDate).formattedTime;
          const now = new Date();
          const endDate = new Date(offer.endDate);
          const totalDuration = endDate - new Date(offer.startDate);
          const remainingTime = Math.max(endDate - now, 0);
          const isExpired = remainingTime <= 0;

          const offerCard = `
            <div id="${offerCardId}" class="col-lg-4 col-md-6 col-sm-12 offer-card ${
            isExpired ? "expired" : ""
          }">
              <div class="card">
                <div class="image-container">
                  <img src="${
                    offer.imageUrl
                  }" class="img-fluid rounded thumbnail-image" alt="Offer Image" />
                  <span class="discount" style="${
                    offer.discountPercentage === null ? "display: none;" : ""
                  }">-${offer.discountPercentage}%</span>
                  <div class="selection-circle" data-offer-id="${offer._id}">
                    <i class="far fa-circle text-primary selected-icon"></i>
                  </div>
                </div>
                <div class="expired-overlay ${
                  isExpired ? "" : "d-none"
                }">انتهى العرض</div>
                <div class="product-detail-container">
                  <div>
                    <h5 class="card-title text-center">${offer.title}</h5>
                    <div class="d-flex flex-column" style="gap: 15px;">
                      <div class="d-flex flex-wrap" style="gap: 10px;">
                        <div class="info-item flex-grow-1" style="flex-basis: 40%;">
                          <span class="info-icon"><i class="fas fa-info-circle"></i></span>
                          <div class="info-text">
                            <span>تفاصيل العرض:</span><br>
                            <span>${offer.description}</span>
                          </div>
                        </div>
                        <div class="info-item flex-grow-1" style="flex-basis: 40%;">
                          <span class="info-icon"><i class="fas fa-tags"></i></span>
                          <div class="info-text">
                            <span>القسم:</span><br>
                            <span>${offer.category}</span>
                          </div>
                        </div>
                      </div>
                      <div class="d-flex flex-wrap" style="gap: 10px;">
                        <div class="info-item flex-grow-1" style="flex-basis: 40%;">
                          <span class="info-icon"><i class="fas fa-clock"></i></span>
                          <div class="info-text">
                            <span>بداية العرض:</span><br>
                            <span>${formattedStartDate} ${formattedStartTime}</span>
                          </div>
                        </div>
                        <div class="info-item flex-grow-1" style="flex-basis: 40%;">
                          <span class="info-icon"><i class="fas fa-clock"></i></span>
                          <div class="info-text">
                            <span>نهاية العرض:</span><br>
                            <span>${formattedEndDate} ${formattedEndTime}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="remaining">
                    <p class="mb-2 text-center">الوقت المتبقي على انتهاء العرض:</p>
                    <div class="countdown-container">
                      <div class="countdown-bar" role="progressbar"></div>
                    </div>
                    <p class="time-remaining text-center mt-2">${
                      isExpired
                        ? "انتهى العرض"
                        : formatTimeRemaining(remainingTime)
                    }</p>
                  </div>
                </div>
              </div>
            </div>
          `;

          offerList.insertAdjacentHTML("afterbegin", offerCard);

          function updateCountdownBar(offer) {
            const now = new Date();
            const endDate = new Date(offer.endDate);
            const totalDuration = endDate - new Date(offer.startDate);
            const remainingTime = Math.max(endDate - now, 0);
            const countdownBar = document.querySelector(
              `#${offerCardId} .countdown-bar`
            );
            if (!isNaN(totalDuration) && totalDuration > 0 && countdownBar) {
              const percentage =
                ((totalDuration - remainingTime) / totalDuration) * 100;
              countdownBar.style.width = `${percentage}%`;
              countdownBar.setAttribute("aria-valuenow", percentage);
            }
          }

          // Initial updates
          updateRemainingTime(offer, offerCardId);
          updateCountdownBar(offer);

          // Update every second
          setInterval(() => {
            updateRemainingTime(offer, offerCardId);
            updateCountdownBar(offer);
          }, 1000);

          // Add click event to the selection circle (enable for admins/cashiers even if expired)
          const selectionCircle = document.querySelector(
            `#${offerCardId} .selection-circle`
          );
          if (
            selectionCircle &&
            (userRole === "admin" || userRole === "cashier" || !isExpired)
          ) {
            selectionCircle.addEventListener("click", () => {
              toggleOfferSelection(offer._id, offerCardId);
            });
          }
        });
      } else {
        $("#offerNotFound").removeClass("d-none").addClass("d-block");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      errorModal.show();
    });

  // Initialize the "Remove Offers" button
  const removeOffersButton = document.getElementById("remove-offers");
  removeOffersButton.disabled = true;
  removeOffersButton.textContent = `حذف العروض (0)`;

  // Add event listener for the "Remove Offers" button
  removeOffersButton.addEventListener("click", () => {
    removeSelectedOffers();
  });

  // Add event listener for the "Edit Offer" button
  const editOfferButton = document.getElementById("edit-offer");
  editOfferButton.addEventListener("click", () => {
    if (selectedOfferId) {
      const editOfferLink = `/offers/edit-offer?offerId=${selectedOfferId}`;
      window.location.href = editOfferLink;
    }
  });
});

// Function to toggle offer selection
function toggleOfferSelection(offerId, offerCardId) {
  const index = selectedOfferIds.indexOf(offerId);
  const selectionCircle = document.querySelector(
    `#${offerCardId} .selection-circle`
  );
  if (selectionCircle) {
    const selectedIcon = selectionCircle.querySelector(".selected-icon");
    if (index === -1) {
      selectedOfferIds.push(offerId);
      selectedOfferId = offerId;
      selectedIcon.classList.remove("fa-circle", "far");
      selectedIcon.classList.add("fa-circle-check", "fas");
    } else {
      selectedOfferIds.splice(index, 1);
      selectedOfferId =
        selectedOfferIds.length > 0 ? selectedOfferIds[0] : null;
      selectedIcon.classList.remove("fa-circle-check", "fas");
      selectedIcon.classList.add("fa-circle", "far");
    }

    const removeOffersButton = document.getElementById("remove-offers");
    removeOffersButton.disabled = selectedOfferIds.length === 0;
    removeOffersButton.textContent = `حذف العروض (${selectedOfferIds.length})`;

    const editOfferButton = document.getElementById("edit-offer");
    if (selectedOfferIds.length === 1) {
      editOfferButton.classList.remove("disabled");
      editOfferButton.dataset.selectedOfferId = selectedOfferIds[0];
    } else {
      editOfferButton.classList.add("disabled");
      delete editOfferButton.dataset.selectedOfferId;
    }
    updateEditOfferLink(selectedOfferId);
  }
}

// Function to remove selected offers
function removeSelectedOffers() {
  if (selectedOfferIds.length === 0) {
    return;
  }

  const successModal = new bootstrap.Modal(
    document.getElementById("successModal")
  );
  const errorModal = new bootstrap.Modal(document.getElementById("errorModal"));

  const deletePromises = selectedOfferIds.map((offerId) => {
    return fetch(`/api/v1/offers/${offerId}`, {
      method: "DELETE",
    });
  });

  Promise.all(deletePromises)
    .then((responses) => {
      const successfullyDeletedIds = [];
      responses.forEach((response, index) => {
        if (response.status === 204) {
          successfullyDeletedIds.push(selectedOfferIds[index]);
        }
      });

      successfullyDeletedIds.forEach((offerId) => {
        const offerCard = document.querySelector(`#offer-card-${offerId}`);
        if (offerCard) {
          offerCard.remove();
        }
      });

      selectedOfferIds.length = 0;
      const removeOffersButton = document.getElementById("remove-offers");
      removeOffersButton.disabled = true;
      removeOffersButton.textContent = `حذف العروض (0)`;
      updateEditOfferLink(null);
      successModal.show();
    })
    .catch((error) => {
      console.error("Error while deleting selected offers:", error);
      errorModal.show();
    });
}

// Function to get user role
async function getUserRole() {
  try {
    const response = await fetch("/api/v1/users/me");
    const data = await response.json();
    if (data.status === "success" && data.data && data.data.data) {
      return data.data.data.role;
    } else {
      console.error("Failed to retrieve user data");
      return null;
    }
  } catch (error) {
    console.error("Error while fetching user data:", error);
    return null;
  }
}

// Function to update the "Edit Offer" button link
function updateEditOfferLink(offerId) {
  const editOfferButton = document.getElementById("edit-offer");
  if (offerId && selectedOfferIds.length === 1) {
    editOfferButton.href = `/offers/edit-offer?offerId=${offerId}`;
    editOfferButton.classList.remove("disabled");
  } else {
    editOfferButton.href = "javascript:void(0);";
    editOfferButton.classList.add("disabled");
  }
}
