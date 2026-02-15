function showMessage(element, message, type = "error") {
    element.textContent = message;

    element.classList.remove("d-none", "text-danger", "text-success");

    if (type === "error") {
        element.classList.add("text-danger");
    } else {
        element.classList.add("text-success");
    }
}

function setLoading(button, isLoading) {
    if (isLoading) {
        button.dataset.originalText = button.innerHTML;
        button.disabled = true;
        button.innerHTML = `
            <span class="spinner-border spinner-border-sm"></span>
            Loading...
        `;
    } else {
        button.disabled = false;
        button.innerHTML = button.dataset.originalText;
    }
}
