let ratingsCount = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}; // Store count of ratings

function handleFormSubmit(event) {
    event.preventDefault();

    const feedbackDetails = {
        name: event.target.name.value,
        rating: parseInt(event.target.rating.value),
    };

    const userId = event.target.dataset.userId;

    if (userId) {
        // Editing existing feedback
        axios
            .put(`https://crudcrud.com/api/85462fa7c9144286a4c3f7c74c433a62/data/${userId}`, feedbackDetails)
            .then((response) => {
                updateFeedbackOnScreen(response.data);
                updateRatingCount(response.data.rating);
            })
            .catch((error) => console.log(error));
    } else {
        // Adding new feedback
        axios
            .post("https://crudcrud.com/api/85462fa7c9144286a4c3f7c74c433a62/data", feedbackDetails)
            .then((response) => {
                displayFeedbackOnScreen(response.data);
                updateRatingCount(feedbackDetails.rating);
            })
            .catch((error) => console.log(error));
    }

    event.target.reset();
    delete event.target.dataset.userId;
    updateStarDisplay();
}

window.addEventListener("DOMContentLoaded", () => {
    axios
        .get("https://crudcrud.com/api/85462fa7c9144286a4c3f7c74c433a62/data")
        .then((response) => {
            response.data.forEach(feedback => {
                displayFeedbackOnScreen(feedback);
                updateRatingCount(feedback.rating);
            });
            updateStarDisplay();
        })
        .catch((error) => console.log(error));
});

function deleteFeedback(userId) {
    axios
        .delete(`https://crudcrud.com/api/85462fa7c9144286a4c3f7c74c433a62/data/${userId}`)
        .then(() => removeFeedbackFromScreen(userId))
        .catch((error) => console.log(error));
}

function displayFeedbackOnScreen(feedbackDetails) {
    const feedbackItem = document.createElement("li");
    feedbackItem.setAttribute("data-id", feedbackDetails._id);
    feedbackItem.innerHTML = `
        ${feedbackDetails.name} - ${'★'.repeat(feedbackDetails.rating)} (${feedbackDetails.rating} Stars)
        <button class="edit-btn">Edit</button>
        <button class="delete-btn">Delete</button>
    `;

    const feedbackList = document.querySelector(".feedback-list");
    feedbackList.appendChild(feedbackItem);

    feedbackItem.querySelector('.delete-btn').addEventListener("click", function () {
        deleteFeedback(feedbackDetails._id);
    });

    feedbackItem.querySelector('.edit-btn').addEventListener("click", function () {
        document.getElementById("name").value = feedbackDetails.name;
        document.getElementById("rating").value = feedbackDetails.rating;
        document.getElementById("feedback-form").dataset.userId = feedbackDetails._id;
    });
}

function updateFeedbackOnScreen(feedbackDetails) {
    const feedbackList = document.querySelector(".feedback-list");
    const feedbackItem = feedbackList.querySelector(`li[data-id="${feedbackDetails._id}"]`);

    if (feedbackItem) {
        feedbackItem.innerHTML = `
            ${feedbackDetails.name} - ${'★'.repeat(feedbackDetails.rating)} (${feedbackDetails.rating} Stars)
            <button class="edit-btn">Edit</button>
            <button class="delete-btn">Delete</button>
        `;
    }
}

function removeFeedbackFromScreen(userId) {
    const feedbackList = document.querySelector(".feedback-list");
    const feedbackItem = feedbackList.querySelector(`li[data-id="${userId}"]`);

    if (feedbackItem) {
        feedbackList.removeChild(feedbackItem);
        const deletedRating = parseInt(feedbackItem.textContent.match(/\((\d) Stars\)/)[1]);
        updateRatingCount(-deletedRating);
    }
}

function updateRatingCount(rating) {
    if (rating > 0) {
        ratingsCount[rating]++;
    } else {
        ratingsCount[-rating]--;
    }
    updateStarDisplay();
}

function updateStarDisplay() {
    const starLines = document.querySelectorAll('.star-line');
    starLines.forEach(line => {
        const rating = parseInt(line.getAttribute('data-rating'));
        const count = ratingsCount[rating];
        line.querySelector('.count').textContent = count;
    });
}

// Attach handleFormSubmit to the form's submit event
const form = document.getElementById('feedback-form');
form.addEventListener('submit', handleFormSubmit);
