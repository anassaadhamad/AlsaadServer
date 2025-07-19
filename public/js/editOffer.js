document.addEventListener("DOMContentLoaded", () => {
  const editOfferForm = document.getElementById("edit-offer-form");
  const successModal = new bootstrap.Modal(
    document.getElementById("successModal")
  );
  const errorModal = new bootstrap.Modal(document.getElementById("errorModal"));
  const closeButton = document.getElementById("close-button");

  // Store the original image URL to detect if it should be sent
  let originalImageUrl = "";

  // Function to fetch and populate offer data
  const populateOfferData = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const offerId = urlParams.get("offerId");

    try {
      const response = await fetch(`/api/v1/offers/${offerId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch offer data: ${response.statusText}`);
      }

      const data = await response.json();
      const offerData = data.data.data;

      // Populate form fields with offer data
      editOfferForm.querySelector("#title").value = offerData.title || "";
      editOfferForm.querySelector("#description").value =
        offerData.description || "";

      // Display current image URL
      const imageUrlInput = editOfferForm.querySelector("#image");
      const currentImageDisplay = editOfferForm.querySelector("#current-image");
      if (offerData.imageUrl) {
        const fileName = offerData.imageUrl.split("/").pop();
        currentImageDisplay.textContent = `الصورة الحالية: ${fileName}`;
        originalImageUrl = offerData.imageUrl; // Store the original image URL
      } else {
        currentImageDisplay.textContent = "لا توجد صورة حالية";
        originalImageUrl = getDefaultImageURL(offerData.category || "");
      }

      // Format dates
      const formattedStartDate = offerData.startDate
        ? new Date(offerData.startDate).toISOString().slice(0, 16)
        : "";
      const formattedEndDate = offerData.endDate
        ? new Date(offerData.endDate).toISOString().slice(0, 16)
        : "";
      editOfferForm.querySelector("#startDate").value = formattedStartDate;
      editOfferForm.querySelector("#endDate").value = formattedEndDate;
      editOfferForm.querySelector("#discountPercentage").value =
        offerData.discountPercentage || "";
      editOfferForm.querySelector("#category").value = offerData.category || "";
    } catch (error) {
      console.error("Error fetching offer data:", error);
      errorModal.show();
    }
  };

  // Function to update offer data
  const updateOfferData = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const offerId = urlParams.get("offerId");

    const formData = new FormData(editOfferForm);
    const imageFile = formData.get("image");
    const hasNewImage = imageFile && imageFile.size > 0;

    // Warn user if they try to upload a new image
    if (hasNewImage) {
      errorModal.show();
      document.querySelector("#errorModal .modal-body").textContent =
        "تحديث الصور غير مدعوم حاليًا. يرجى التواصل مع الدعم الفني لتحديث الصورة.";
      return;
    }

    // Prepare data for submission (always JSON)
    const offerData = {
      title: formData.get("title"),
      description: formData.get("description"),
      startDate: formData.get("startDate"),
      endDate: formData.get("endDate"),
      discountPercentage: parseInt(formData.get("discountPercentage")) || null,
      category: formData.get("category"),
      imageUrl:
        originalImageUrl || getDefaultImageURL(formData.get("category")),
    };

    // Remove null or empty fields to avoid sending undefined values
    Object.keys(offerData).forEach((key) => {
      if (offerData[key] === null || offerData[key] === "") {
        delete offerData[key];
      }
    });

    // Log the data being sent for debugging
    console.log("Sending offer data:", offerData);

    try {
      const response = await fetch(`/api/v1/offers/${offerId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(offerData),
      });

      const responseData = await response.json();
      console.log("Server response:", responseData);

      if (response.ok && responseData.status === "success") {
        successModal.show();
        document.getElementById("successModalConfirm").addEventListener(
          "click",
          () => {
            // Redirect with cache-busting query parameter to ensure fresh data
            window.location.href = `/offers?t=${new Date().getTime()}`;
          },
          { once: true }
        );
      } else {
        console.error(
          "Update failed:",
          responseData.message || "Unknown error"
        );
        document.querySelector("#errorModal .modal-body").textContent =
          responseData.message ||
          "فشل في تحديث العرض. الرجاء المحاولة مرة أخرى.";
        errorModal.show();
      }
    } catch (error) {
      console.error("Error updating offer:", error);
      document.querySelector("#errorModal .modal-body").textContent =
        "حدث خطأ أثناء تحديث العرض. الرجاء المحاولة مرة أخرى.";
      errorModal.show();
    }
  };

  // Form validation and submission
  editOfferForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Bootstrap form validation
    if (!editOfferForm.checkValidity()) {
      e.stopPropagation();
      editOfferForm.classList.add("was-validated");
      return;
    }

    await updateOfferData();
  });

  // Close button to navigate back to offers page
  closeButton.addEventListener("click", () => {
    window.location.href = `/offers?t=${new Date().getTime()}`;
  });

  // Fetch and populate offer data on page load
  populateOfferData();
});

// Function to get the default image URL based on category
function getDefaultImageURL(category) {
  const imageUrl = `./../../Uploads/images/`;

  switch (category) {
    case "المفروشات":
      return imageUrl + "image1.jpg";
    case "الأدوات المنزلية":
      return imageUrl + "image2.png";
    case "الملابس":
      return imageUrl + "image3.jpg";
    case "النجف والأباجورات":
      return imageUrl + "image4.jpg";
    case "التحف":
      return imageUrl + "image5.jpg";
    case "كل الأقسام":
      return imageUrl + "image6.jpg";
    default:
      return imageUrl + "logo_gold.png";
  }
}
