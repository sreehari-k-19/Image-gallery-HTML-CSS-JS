const apiKey = 'rTpV0zwYIaA8GuTZ4hIU6tNcuKdyxmJxcXjOykQskeV9LqS0pOhrDIek';
const perPage = 12;
let currentPage = 1;
let searchTerm = null;
const imgContainer = document.getElementById("img-container")
const loadMoreBtn = document.getElementById("loadmore-button")
const searchInput = document.querySelector('.search-box input')
let menuBtns = document.querySelectorAll('.menus-button')
let galleryTitle = document.querySelector(".gallery-title")
let index = 1;
let autoplayInterval;

function generateApiUrl(endpoint, currentPage, perPage, searchTerm = '') {
  let apiUrl = '';
  if (endpoint === 'curated') {
    apiUrl = `https://api.pexels.com/v1/curated?page=${currentPage}&per_page=${perPage}`;
  } else if (endpoint === 'search') {
    apiUrl = `https://api.pexels.com/v1/search?query=${searchTerm}&page=${currentPage}&per_page=${perPage}`;
  }

  return apiUrl;
}

const getImages = (apiURL) => {
  searchInput.blur();
  loadMoreBtn.innerText = "Loading...";
  loadMoreBtn.classList.add("disabled");
  fetch(apiURL, {
    headers: { Authorization: apiKey }
  }).then(res => res.json()).then(data => {
    data.photos.forEach((image, num) => {
      const aspectRatio = image.width / image.height;
      const determineImageSrc = (image) => {
        if (aspectRatio >= 1.2) {
          return image.src.large2x || image.src.large || image.src.medium || image.src.small || image.src.tiny;
        } else if (aspectRatio >= 0.65) {
          return image.src.large || image.src.medium || image.src.small || image.src.tiny || image.src.large;
        } else {
          return image.src.medium || image.src.large || image.src.small;
        }
      };

      const viewImage = determineImageSrc(image);
      const newImageCards = imgContainer.querySelectorAll('.card');
      const cardHTML = `
            <div class="card ${aspectRatio >= 1.2 ? 'card_large' : aspectRatio >= 0.65 ? 'card_medium' : 'card_small'}"  data-index=${newImageCards.length} >
              <img src="${viewImage}" />
              <div class="details">
                <div class="photographer">
                  <i class="uil uil-camera"></i>
                  <span>${image.photographer}</span>
                </div>
                <button onclick="downloadImg(event, '${viewImage}')">
                  <i class="uil uil-import"></i>
                </button>
              </div>
            </div>
          `;

      imgContainer.insertAdjacentHTML('beforeend', cardHTML);
      loadMoreBtn.innerText = "Load More";
      loadMoreBtn.classList.remove("disabled");
      newImageCards.forEach(card => {
        card.addEventListener('click', currentImage);
      });
    });
  }).catch((error) => {
    console.log(error)
    alert("Failed to load images!")
  });
}

// image prev slide

const galleryItem = document.getElementsByClassName("card");
const prevBoxContainer = document.createElement("div");
const prevBoxContent = document.createElement("div");
const prevBoxImg = document.createElement("img");
const prevBoxPrev = document.createElement("div");
const prevBoxNext = document.createElement("div");

prevBoxContainer.classList.add("prevbox");
prevBoxContent.classList.add("prevbox-content");
prevBoxPrev.classList.add("uil", "uil-angle-left-b", "prevbox-prev");
prevBoxNext.classList.add("uil", "uil-angle-right-b", "prevbox-next");

prevBoxImg.addEventListener("mouseenter", pauseAutoplay);
prevBoxImg.addEventListener("mouseleave", startAutoplay);

prevBoxContainer.appendChild(prevBoxContent);
prevBoxContent.appendChild(prevBoxImg);
prevBoxContent.appendChild(prevBoxPrev);
prevBoxContent.appendChild(prevBoxNext);
document.body.appendChild(prevBoxContainer);



function startAutoplay() {
  console.log("auto play")
  if (!autoplayInterval) {
    autoplayInterval = setInterval(() => {
      slideImage(1);
    }, 3000);
  }
}

function pauseAutoplay() {
  console.log("break interval")
  clearInterval(autoplayInterval);
  autoplayInterval = null;
}

function showprevBox(n) {
  if (n >= galleryItem.length) {
    index = 0;
  } else if (n < 0) {
    index = galleryItem.length - 1;
  }
  let imageLocation = galleryItem[index].children[0].getAttribute("src");
  prevBoxImg.setAttribute("src", imageLocation);
  startAutoplay()
}

function currentImage() {
  prevBoxContainer.style.display = "block";
  let imageIndex = parseInt(this.getAttribute("data-index"));
  console.log(imageIndex, 'img indexxxx')
  showprevBox(index = imageIndex);
}

function slideImage(n) {
  showprevBox(index += n);
}
function prevImage() {
  slideImage(-1);
}
function nextImage() {
  slideImage(1);
}


function closeprevBox(event) {
  if (this === event.target) {
    prevBoxContainer.style.display = "none";
    clearInterval(autoplayInterval);
  }
}

const loadMoreImages = () => {
  currentPage++;
  let apiUrl = searchTerm ? generateApiUrl('search', currentPage, perPage, searchTerm) : generateApiUrl('curated', currentPage, perPage);
  getImages(apiUrl);
}


const loadSearchImages = (e, menu) => {
  if (e) {
    if (e.target.value === "" || e.target.value.includes(".") || e.target.value.includes("#") || e.target.value.includes("$")) {
      searchTerm = null;
      return;
    }
  }
  if (menu || e.key === "Enter") {
    if (!menu) {
      menuBtns.forEach(btn => {
        btn.classList.remove('active-button');
      });
    }
    currentPage = 1;
    imgContainer.innerHTML = "";
    console.log("dsfdf", searchInput)

    searchTerm = e ? e.target.value : menu;
    let apiUrl = generateApiUrl('search', currentPage, perPage, searchTerm);
    galleryTitle.innerHTML = searchTerm;
    searchInput.value = "";
    getImages(apiUrl);
  }
};


menuBtns.forEach(button => {
  button.addEventListener('click', () => {
    menuBtns.forEach(btn => {
      btn.classList.remove('active-button');
    });
    button.classList.add('active-button');
    const filter = button.dataset.filter;
    loadSearchImages(null, filter)
  });
});

const downloadImg = (event, imgUrl) => {
  event.stopPropagation();
  fetch(imgUrl).then(res => res.blob()).then(blob => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = new Date().getTime();
    a.click();
  }).catch(() => alert("Failed to download image!"));
}

document.addEventListener("DOMContentLoaded", function () {
  let apiKey = generateApiUrl('curated', currentPage, perPage)
  getImages(apiKey)
})


let uploadIcon;
let fileInput;
let isUploadModalOpen = false;


function uploadModal() {
  let uploadForm = document.getElementsByClassName('upload-image');
  console.log(uploadModal)
  uploadForm[0].style.display = 'block';
  fileInput = document.querySelector('#fileInput');
  fileInput.addEventListener('change', previewImage);
}

function uploadModalClose() {
  const form = document.getElementById("uploadForm");
  form.reset();
  const imageLabel = document.querySelector('.image-upload-label');
  imageLabel.style.backgroundImage = '';
  imageLabel.style.height = "";
  let uploadForm = document.getElementsByClassName('upload-image')
  uploadForm[0].style.display = 'none';
}



function previewImage(event) {
  const file = event.target.files[0];
  const imageLabel = document.querySelector('.image-upload-label');
  const errorLabel = document.querySelector('.upload-errror');

  const reader = new FileReader();

  reader.onload = function (e) {
    if (isValidImage(file)) {
      imageLabel.style.backgroundImage = `url('${e.target.result}')`;
      imageLabel.style.opacity = 1;
      imageLabel.style.height = "20rem";
      errorLabel.style.display = 'none';
    } else {
      errorLabel.style.display = 'block';
      setTimeout(() => {
        errorLabel.style.display = 'none';
      }, 5000)
    }
  };

  reader.readAsDataURL(file);
}

function isValidImage(file) {
  const supportedTypes = ['image/jpeg', 'image/png'];
  if (supportedTypes.includes(file.type)) {
    return true;
  }
  return false;
}


loadMoreBtn.addEventListener("click", loadMoreImages);
searchInput.addEventListener("keyup", loadSearchImages);
prevBoxPrev.addEventListener("click", prevImage);
prevBoxNext.addEventListener("click", nextImage);
prevBoxContainer.addEventListener("click", closeprevBox);



