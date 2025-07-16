document.addEventListener("DOMContentLoaded", () => {
  const offerForm = document.getElementById("offer-form");

  offerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(offerForm);
    const offerData = {
      title: formData.get("title"),
      description: formData.get("description"),
      startDate: formData.get("startDate"),
      endDate: formData.get("endDate"),
      discountPercentage: parseInt(formData.get("discountPercentage")),
      category: formData.get("category"),
      // Default image URLs based on category
      imageUrl: getDefaultImageURL(formData.get("category")),
    };

    try {
      const response = await fetch("/api/v1/offers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(offerData),
      });

      if (response.status === 201) {
        alert("عرض جديد تم إنشاؤه بنجاح.");
        setTimeout(function () {
          window.location.href = "/offers";
        }, 200);
      } else {
        alert("فشل في إنشاء العرض. الرجاء المحاولة مرة أخرى.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("حدث خطأ أثناء الإرسال. الرجاء المحاولة مرة أخرى.");
    }
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
