// Array to store selected offer IDs
const selectedOfferIds = [];
let selectedOfferId = null; // Initialize it as null

document.addEventListener("DOMContentLoaded", () => {
  fetch("/api/v1/offers")
    .then((response) => response.json())
    .then((data) => {
      const offerList = document.getElementById("offer-list");

      // Function to format the date and time
      function formatDateTime(dateTime) {
        const date = new Date(dateTime);
        const formattedDate = date.toLocaleDateString("ar-EG", {
          // year: "numeric",
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

      function updateRemainingTime(offer) {
        const now = new Date();
        const endDate = new Date(offer.endDate);
        const timeRemaining = Math.max(endDate - now, 0); // Time remaining in milliseconds
        const formattedTimeRemaining = formatTimeRemaining(timeRemaining);

        return formattedTimeRemaining;
      }

      // Inside your data.forEach loop where you create offer cards
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
          const totalDuration = endDate - offer.startDate;
          const remainingTime = Math.max(endDate - now, 0);

          const offerCard = `
            <div id="${offerCardId}" class="cards d-flex flex-column justify-content-between col-lg-4 col-md-6 col-sm-12 offer-card">
              <div class="card flex-grow-1">
                <div class="image-container">
                  <div class="first">
                    <div class="d-flex justify-content-between align-items-center">
                      <span class="discount">-${offer.discountPercentage}%</span>
                    </div>
                  </div>
                  <img
                    src="${offer.imageUrl}"
                    class="img-fluid rounded thumbnail-image"
                    alt="Offer Image"
                  />
                </div>
                <div class="selection-circle" data-offer-id="${offer._id}">
                  <i
                    class="far fa-circle text-primary selected-icon bg-white rounded-circle"
                  ></i>
                </div>
            
                <div class="product-detail-container d-flex flex-column justify-content-between flex-grow-1 p-2">

                  <div>
                    <h5 class="card-title text-center">${offer.title}</h5>
              
                    <div class="d-flex flex-column justify-content-between" style="gap: 30px">
                      <div class="d-flex flex-wrap" style="gap: 10px">
                        <div
                          class="d-flex justify-content-start align-items-start flex-grow-1"
                          style="gap: 7px; flex-basis: 40%"
                        >
                          <span style="font-weight: bold"
                            ><i class="fas fa-info-circle"></i
                          ></span>
                          <div class="d-flex flex-column">
                            <span>تفاصيل العرض:</span>
                            <span class="category" style="color: #f00"
                              >${offer.description}</span
                            >
                          </div>
                        </div>

                        <div
                          class="d-flex justify-content-start align-items-start flex-grow-1"
                          style="gap: 7px; flex-basis: 40%"
                        >
                          <span style="font-weight: bold"><i class="fas fa-tags"></i></span>
                          <div class="d-flex flex-column">
                            <span>القسم:</span>
                            <span class="category" style="color: #f00"
                              >${offer.category}</span
                            >
                          </div>
                        </div>
                      </div>
              
                      <div class="d-flex flex-wrap" style="gap: 10px">
                        <div
                          class="d-flex justify-content-start align-items-start flex-grow-1"
                          style="gap: 7px; flex-basis: 40%"
                        >
                          <span style="font-weight: bold"><i class="fas fa-clock"></i></span>
                          <div class="d-flex flex-column">
                            <span>بداية العرض:</span>
                            <span class="category" style="color: #f00"
                              >${formattedStartDate}</span
                            >
                            <span class="category" style="color: #f00"
                              >${formattedStartTime}</span
                            >
                          </div>
                        </div>
              
                        <div
                          class="d-flex justify-content-start align-items-start flex-grow-1"
                          style="gap: 7px; flex-basis: 40%"
                        >
                          <span style="font-weight: bold"><i class="fas fa-clock"></i></span>
                          <div class="d-flex flex-column">
                            <span>نهاية العرض:</span>
                            <span class="category" style="color: #f00"
                              >${formattedEndDate}</span
                            >
                            <span class="category" style="color: #f00"
                              >${formattedEndTime}</span
                            >
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="remaining">
                    <p class="mb-2 mt-3 text-center">الوقت المتبقي على إنتهاء العرض:</p>
                    <div class="progress overflow-hidden p-relative gradient-progress-bar">
                      <div class="progress-bar" role="progressbar"></div>
                    </div>
                    <p class="time-remaining"></p>
                  </div>
                </div>
              </div>
            </div>            
        `;

          offerList.insertAdjacentHTML("afterbegin", offerCard);

          const timeRemainingElement = document.querySelector(
            `#${offerCardId} .time-remaining`
          );

          // Function to update the remaining time dynamically
          function updateRemainingTimeDisplay() {
            const formattedTimeRemaining = updateRemainingTime(offer);
            timeRemainingElement.textContent = `${formattedTimeRemaining}`;
            timeRemainingElement.classList.add("text-center", "mt-2");
          }

          function removeDiscountPercentage() {
            if (offer.discountPercentage === null) {
              $(`#${offerCardId} .discount`).css("display", "none");
            }
          }

          // function removeOffer(offerId) {
          //   const offerCard = document.getElementById(offerId);

          //   if (offerCard) {
          //     offerCard.remove(); // Remove the offer card from the page
          //   } else {
          //     console.error(`Offer with ID ${offerId} not found.`);
          //   }
          // }

          function updateProgressBar(offer) {
            const now = new Date();
            const endDate = new Date(offer.endDate);
            const totalDuration = endDate - new Date(offer.startDate);
            const remainingTime = Math.max(endDate - now, 0);

            if (!isNaN(totalDuration)) {
              const percentage =
                ((totalDuration - remainingTime) / totalDuration) * 100;

              const progressBars = document.querySelectorAll(
                `#${offerCardId} .progress-bar`
              );
              progressBars.forEach((progressBar) => {
                progressBar.style.width = `${percentage}%`;
                progressBar.setAttribute("aria-valuenow", percentage);
              });
            }
          }

          // Initial update remaining time display
          updateRemainingTimeDisplay();

          // Remove discount percentage if it is not available
          removeDiscountPercentage();

          // Update the remaining time every second
          setInterval(updateRemainingTimeDisplay, 1000);

          // Call the updateProgressBar function to initialize the progress bar
          updateProgressBar(offer);

          // Update the progress bar every second
          setInterval(() => {
            updateProgressBar(offer);
          }, 1000);

          // Add click event to the selection circle
          const selectionCircle = document.querySelector(
            `#${offerCardId} .selection-circle`
          );
          selectionCircle.addEventListener("click", () => {
            toggleOfferSelection(offer._id, offerCardId);
          });
        });

        // Add event listener for the "Remove Offers" button
        const removeOffersButton = document.getElementById("remove-offers");
        removeOffersButton.addEventListener("click", () => {
          removeSelectedOffers();
        });
      } else {
        console.log("Not found");
        $("#offerNotFound").addClass("d-block");
      }
    })
    .catch((error) => console.error("Error:", error));
});

// Initialize the "Remove Offers" button
const removeOffersButton = document.getElementById("remove-offers");
removeOffersButton.disabled = true;
removeOffersButton.textContent = `حذف العروض (0)`;

// Function to toggle offer selection
function toggleOfferSelection(offerId, offerCardId) {
  const index = selectedOfferIds.indexOf(offerId);
  const selectionCircle = document.querySelector(
    `#${offerCardId} .selection-circle`
  );
  if (selectionCircle) {
    const selectedIcon = selectionCircle.querySelector(".selected-icon");
    if (index === -1) {
      // Offer is not selected, add it to the selected list
      selectedOfferIds.push(offerId);
      selectedOfferId = offerId; // Store the selected offer ID

      // Change the selection circle to a check circle
      selectedIcon.classList.remove("fa-circle", "far");
      selectedIcon.classList.add("fa-circle-check", "fas");
    } else {
      // Offer is selected, remove it from the selected list
      selectedOfferIds.splice(index, 1);
      selectedOfferId = offerId; // Store the selected offer ID

      // Change the check circle back to an empty circle
      selectedIcon.classList.remove("fa-circle-check", "fas");
      selectedIcon.classList.add("fa-circle", "far");
    }

    // Check if the "Remove Offers" button should be enabled
    removeOffersButton.disabled = selectedOfferIds.length === 0;
    // Call the updateEditOfferLink function with the selected offer ID
    updateEditOfferLink(selectedOfferId);
    // Check if only one offer is selected and enable the edit button
    const editOfferButton = document.getElementById("edit-offer");
    if (selectedOfferIds.length === 1) {
      editOfferButton.classList.remove("disabled");
      // Get and store the ID of the selected offer
      editOfferButton.dataset.selectedOfferId = selectedOfferIds[0];
    } else {
      editOfferButton.classList.add("disabled");
      // Remove the selected offer ID
      delete editOfferButton.dataset.selectedOfferId;
    }
  }
  removeOffersButton.textContent = `حذف العروض (${selectedOfferIds.length})`;
}

// Function to remove selected offers
function removeSelectedOffers() {
  if (selectedOfferIds.length === 0) {
    // No offers are selected, nothing to remove
    return;
  }

  // Send a DELETE request to remove the selected offers on the server
  const deletePromises = selectedOfferIds.map((offerId) => {
    return fetch(`/api/v1/offers/${offerId}`, {
      method: "DELETE",
    });
  });

  // Handle all delete promises and update the UI
  Promise.all(deletePromises)
    .then((responses) => {
      const successfullyDeletedIds = [];

      responses.forEach((response, index) => {
        if (response.status === 204) {
          // Offer was deleted successfully (status code 204)
          successfullyDeletedIds.push(selectedOfferIds[index]);
        }
      });

      // Remove the corresponding offer cards from the UI
      successfullyDeletedIds.forEach((offerId) => {
        const offerCard = document.querySelector(`#offer-card-${offerId}`);
        if (offerCard) {
          offerCard.remove();
        }
      });

      // Clear the selected offer IDs
      selectedOfferIds.length = 0;

      // Disable the "Remove Offers" button again
      removeOffersButton.disabled = true;

      // Reset remove button text value to default value
      removeOffersButton.textContent = `حذف العروض (${selectedOfferIds.length})`;
    })
    .catch((error) => {
      console.error("Error while deleting selected offers:", error);
    });
}

async function getUserRole() {
  try {
    const response = await fetch("/api/v1/users/me"); // Replace with the function to get the user's role
    const data = await response.json();

    if (data.status === "success" && data.data && data.data.data) {
      const userRole = data.data.data.role;

      return userRole;
    } else {
      console.error("Failed to retrieve user data");
      return null;
    }
  } catch (error) {
    console.error("Error while fetching user data:", error);
    return null;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  getUserRole().then((userRole) => {
    if (userRole === "admin" || userRole === "cashier") {
      $("#admin-actions").css("display", "block");
    }
  });

  updateEditOfferLink(selectedOfferId);

  // Add event listener for the "Edit Offer" button
  const editOfferButton = document.getElementById("edit-offer");
  editOfferButton.addEventListener("click", () => {
    if (selectedOfferId) {
      // If an offer is selected, build the URL with the selected offer ID
      const editOfferLink = `/offers/edit-offer?offerId=${selectedOfferId}`;
      // Redirect to the edit offer page
      window.location.href = editOfferLink;
    }
  });
});

// Function to update the "Edit Offer" button link
function updateEditOfferLink(offerId) {
  const editOfferButton = document.getElementById("edit-offer");
  if (offerId) {
    // If an offer is selected, update the link with the offer ID
    editOfferButton.href = `/offers/edit-offer?offerId=${offerId}`;
    editOfferButton.classList.remove("disabled");
  } else {
    // If no offer is selected, disable the link
    editOfferButton.href = "javascript:void(0);";
    editOfferButton.classList.add("disabled");
  }
}
