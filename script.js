let data = [];
const REPOSYTORIES_KEY = "REPOSYTORIES_KEY";

function loadData() {
  const arrRepositories = JSON.parse(localStorage.getItem(REPOSYTORIES_KEY));
  if (Array.isArray(arrRepositories)) {
    data = arrRepositories;
  }
}

function saveData() {
  localStorage.setItem(REPOSYTORIES_KEY, JSON.stringify(data));
}

const page = {
  header: document.querySelector("header"),
  input: document.querySelector("input"),
  main: document.querySelector("main"),
  autocomplete: document.querySelector(".autocomplete__list"),
  autocompleteItem: document.getElementsByClassName("autocomplete__item"),
  wrapper: document.querySelector(".wrapper"),
};

let currentID;

const getRepositoriesDebounce = debounce(getRepositories, 700);

page.input.addEventListener("input", () => {
  getRepositoriesDebounce(page.input.value, generateAutocomplite);
});

page.autocomplete.addEventListener("click", (event) => {
  event.preventDefault();
  if (event.target.closest(".autocomplete__item")) {
    const currentItem = event.target.closest(".autocomplete__item");
    const currentValue = currentItem.children[0].textContent;
    currentID = currentItem.dataset.id;
    getRepositories(currentValue, addRepo);
  }
});

page.wrapper.addEventListener("click", (event) => {
  event.preventDefault();
  if (event.target.classList.contains("card__delete")) {
    const card = event.target.closest(".card");
    deleteRepo(card);
  }
});

function deleteRepo(card) {
  currentID = card.dataset.id;
  data = data.filter((repo) => repo.id != currentID);

  card.remove();
  saveData();
}

async function getRepositories(nameRepo, callback) {
  page.input.classList.remove("search--with-autocomplete");
  page.autocomplete.innerHTML = "";

  if (!page.input.value) return;

  const response = await fetch(
    `https://api.github.com/search/repositories?q=${nameRepo}`
  );
  if (response.ok) {
    const { items } = await response.json();
    callback(items);
  }
}

function addRepo(repositories) {
  repositories.forEach((repo) => {
    if (repo.id === +currentID) {
      data.push(repo);
    }
  });
  saveData();
  renderCards();
}

function renderCards() {
  page.wrapper.innerHTML = "";
  data.forEach((repo) => {
    const text = `
           <article class="card" data-id="${repo.id}">
             <div>
               <div class="card__item">Name: ${repo.name}</div>
               <div class="card__item">Owner: ${repo.owner.login}</div>
               <div class="card__item">Stars: ${repo.stargazers_count}</div>
             </div>
             <div class="card__delete"></div>
           </article>
           `;
    page.wrapper.insertAdjacentHTML("afterbegin", text);
    page.input.value = "";
  });
}

function generateAutocomplite(repositories) {
  repositories.forEach((repo) => {
    if (page.autocompleteItem.length === 5) return;
    const text = `
        <li class="autocomplete__item" data-id="${repo.id}">
            <a href="#" class="autocomplete__link">${repo.name}</a>
          </li>`;
    page.input.classList.add("search--with-autocomplete");
    page.autocomplete.insertAdjacentHTML("beforeend", text);
  });
}

function debounce(fn, debounceTime) {
  let timer;

  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, debounceTime);
  };
}

(() => {
  loadData();
  renderCards();
})();
