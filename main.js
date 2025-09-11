import { fetchData } from "./js/api.js";

export let CART = {};

export const getTotal = () => {
  return Object.values(CART).reduce((runningTotal, currentItem) => {
    const itemSubtotal = currentItem.price * currentItem.quantity;
    return runningTotal + itemSubtotal;
  }, 0);
};

export const setTotal = (element, total) => {
  element.innerText = `৳${total}`;
};

export const removeFromTheCart = (id) => {
  if (CART[id]) {
    delete CART[id]; // this line will obliterate the whole object from the cart
    renderCart();
  }
};

export const renderCart = () => {
  cartItemsContainer.innerHTML = ``;

  if (Object.keys(CART).length === 0) {
    cartItemsContainer.innerHTML = `
    <p class="text-xl font-medium text-center text-white border-2 border-my-primary bg-my-primary py-4 rounded-lg my-4 select-none">
      Cart is Empty!
    </p>
    `;
  } else {
    for (const prop in CART) {
      const { id, name, price, quantity } = CART[prop];

      const listItem = document.createElement("li");
      listItem.className =
        "bg-[#F0FDF4] rounded-lg px-3 py-2 flex items-center justify-between gap-2 select-none";
      listItem.dataset.id = id;
      listItem.innerHTML += `
        <div class="flex flex-col gap-1">
          <p class="font-semibold text-sm leading-5">${name}</p>
          <p class="text-base text-gray-400">৳${price} <i class="fa-solid fa-xmark text-xs"></i> ${quantity}</p>
        </div>
        <i class="CART-DELETE-ICON fa-solid fa-xmark text-base flex items-center justify-center transition-all ease-out duration-150 hover:text-red-500 hover:scale-150"></i>
    `;

      const removeIcon = listItem.querySelector(".CART-DELETE-ICON");
      removeIcon.addEventListener("click", () => {
        removeFromTheCart(listItem.dataset.id);
      });

      // add the list item inside of the container
      cartItemsContainer.appendChild(listItem);
    }
  }
  setTotal(cartTotalElement, getTotal());
};

export const addToTheCart = (plant) => {
  const { id, name, price } = plant;

  if (!CART[id]) {
    CART[id] = { id, name, price, quantity: 1 };
  } else {
    CART[id].quantity += 1;
  }
  renderCart();
};

/* START OF HELPER FUNCTIONS */

const renderPlantCards = (plants) => {
  cardsContainer.innerHTML = ``;
  plants.forEach((plant) => {
    const card = document.createElement("div");
    card.className =
      "bg-white p-4 rounded-lg flex flex-col items-center justify-between gap-3 shadow cursor-pointer";
    card.innerHTML += `
            <img class="rounded-lg aspect-video object-cover" src=${plant.image} alt=${plant.name} />
            <div class="flex flex-col gap-2">
              <h3 class="CARD-TITLE font-semibold text-sm leading-5">${plant.name}</h3>
              <p class="font-normal text-xs line-clamp-3">${plant.description}</p>
              <div class="flex items-center justify-between">
                <div class="badge text-my-primary bg-[#DCFCE7] rounded-full px-3 py-1">${plant.category}</div>
                <div class="font-semibold text-sm leading-5 flex-1 text-right">৳${plant.price}</div>
              </div>
            </div>
            <button class="ADD-TO-CART-BTN bg-my-primary text-white py-3 w-full rounded-full font-medium shadow transition-all duration-200 ease-out hover:bg-my-primary/70">
              Add to Cart
            </button>
              `;

    // add to cart feature.
    const addToCartBtn = card.querySelector(".ADD-TO-CART-BTN");
    addToCartBtn.addEventListener("click", () => {
      addToTheCart(plant);
    });

    // doing the modal shit here
    const plantName = card.querySelector(".CARD-TITLE");

    plantName.addEventListener("click", async () => {
      const { plants: plantObj } = await fetchData(
        `https://openapi.programming-hero.com/api/plant/${plant.id}`
      );
      modalContentBox.innerHTML = `
            <div class="text-black flex flex-col gap-4">
              <img src=${plantObj.image} alt=${plantObj.name}
                class="rounded-lg object-fit" />
              <div class="flex flex-col gap-1">
                <h3 class="text-3xl font-medium">${plantObj.name}</h3>
                <p>${plantObj.description}</p>
              </div>
              <div class="flex items-center justify-between ">
                <div class="badge badge-soft badge-xl badge-info rounded-full">
                  ${plantObj.category}
                </div>
                <div class="text-2xl">৳ ${plantObj.price}</div>
              </div>
            </div>
        `;
      modalElement.showModal();
    });
    cardsContainer.appendChild(card);
  });
};
/* END OF HELPER FUNCTIONS */

/* =============== variables to grab the DOM Elements ==================== */
const buttonsContainer = document.querySelector("#category-name-container");
const cardsContainer = document.querySelector("#CARDS-CONTAINER");
const modalElement = document.querySelector("#my_modal_5");
const modalContentBox = document.querySelector("#MODAL-CONTENT-BOX");
const cartItemsContainer = document.querySelector("#CART-ITEMS-CONTAINER");
const cartTotalElement = document.querySelector("#CART-TOTAL-ELEMENT");
/* ======================================================================== */
/* ================= 👇👇👇 MAIN LOGIC IS BELOW 👇👇👇 =================== */
/* ======================================================================== */

const doTheInitialDOMStuff = async () => {
  // category list
  const { categories: buttonList } = await fetchData(
    "https://openapi.programming-hero.com/api/categories"
  );

  // (clear the buttonsContainer) AND (adds the buttons)
  buttonsContainer.innerHTML = ``;
  buttonList.forEach((item) => {
    buttonsContainer.innerHTML += `
        <li data-id="${item.id}"
            class="CATEGORY-BUTTON px-2.5 py-2 rounded-sm transition-all duration-200 ease-out hover:bg-my-primary hover:text-white font-medium">
            ${item.category_name}
        </li>
        `;
  });

  // (grabbing) AND (adding the toggle feature AND fetching data to show in the DOM)
  const categoryButtons = document.querySelectorAll(".CATEGORY-BUTTON");
  categoryButtons.forEach((button) => {
    const activeClassName = "my-btn-active";
    button.addEventListener("click", async () => {
      // *** Toggling the active state for glow up ***
      categoryButtons.forEach((i) => i.classList.remove(activeClassName));
      button.classList.add(activeClassName);

      // *** Fetching the plants for this perticular category ***
      const categoryID = button.dataset.id;

      if (categoryID !== "*") {
        const { plants: categorySpecificPlants } = await fetchData(
          `https://openapi.programming-hero.com/api/category/${categoryID}`
        );
        renderPlantCards(categorySpecificPlants);
      } else {
        const { plants: allPlantsList } = await fetchData(
          "https://openapi.programming-hero.com/api/plants"
        );
        renderPlantCards(allPlantsList);
      }
    });
  });

  /**
   *
   * Initial load: fetch all plants
   *
   */
  const { plants: allPlantsList } = await fetchData(
    "https://openapi.programming-hero.com/api/plants"
  );
  renderPlantCards(allPlantsList);
};

doTheInitialDOMStuff();
