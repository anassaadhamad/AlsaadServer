document.addEventListener("DOMContentLoaded", () => {
  const editOfferForm = document.getElementById("edit-offer-form");
  const saveChangesButton = document.querySelector("button[type='submit']");
  const closeButton = document.getElementById("close-button");

  // Function to fetch and populate offer data
  const populateOfferData = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const offerId = urlParams.get("offerId");

    try {
      const response = await fetch(`/api/v1/offers/${offerId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch offer data");
      }

      const data = await response.json();
      const offerData = data.data.data;

      // Populate form fields with offer data
      editOfferForm.querySelector("#title").value = offerData.title;
      editOfferForm.querySelector("#description").value = offerData.description;

      // Display the current file name or a link to download
      const imageUrlInput = editOfferForm.querySelector("#image");
      const currentFileName = offerData.imageUrl;

      if (currentFileName) {
        const fileDisplay = document.createElement("p");
        fileDisplay.textContent = `Current File: ${currentFileName}`;
        imageUrlInput.parentNode.insertBefore(
          fileDisplay,
          imageUrlInput.nextSibling
        );
      } else {
        imageUrlInput.value = ""; // Clear the input field
      } // Format dates

      const formattedStartDate = new Date(offerData.startDate)
        .toISOString()
        .slice(0, 16);
      const formattedEndDate = new Date(offerData.endDate)
        .toISOString()
        .slice(0, 16);
      editOfferForm.querySelector("#startDate").value = formattedStartDate;
      editOfferForm.querySelector("#endDate").value = formattedEndDate;
      editOfferForm.querySelector("#discountPercentage").value =
        offerData.discountPercentage;
      editOfferForm.querySelector("#category").value = offerData.category;
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Function to send a PATCH request to update the offer
  const updateOfferData = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const offerId = urlParams.get("offerId");

      const formData = new FormData(editOfferForm);
      const offerData = Object.fromEntries(formData);

      const response = await fetch(`/api/v1/offers/${offerId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(offerData),
      });

      if (response.ok) {
        alert("تم تحديث العرض بنجاح.");
        setTimeout(function () {
          window.location.href = "/offers";
        }, 200);
      } else {
        alert("فشل في تحديث العرض. الرجاء المحاولة مرة أخرى.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("حدث خطأ أثناء الإرسال. الرجاء المحاولة مرة أخرى.");
    }
  };

  // Add an event listener to fetch and populate offer data when the page loads
  populateOfferData();

  // Add an event listener to update offer data when the "Save Changes" button is clicked
  saveChangesButton.addEventListener("click", (e) => {
    e.preventDefault(); // Prevent the default form submission
    updateOfferData();
  });

  // Add an event listener to the close button to navigate back to offers page
  closeButton.addEventListener("click", () => {
    window.location.href = "/offers"; // Adjust the URL as needed
  });
});

// Function to get the default image URL based on category
function getDefaultImageURL(category) {
  const imageUrl = `./../../uploads/images/`;

  switch (category) {
    case "المفروشات":
      return imageUrl + "image1.jpg";
    case "الأدوات المنزلية":
      return imageUrl + "image2.jpg";
    // Add more cases for other categories with their default image URLs
    default:
      return imageUrl + "logo_gold.png"; // Default URL for unknown categories
  }
}
