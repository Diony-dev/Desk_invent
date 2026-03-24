import { get_all_items, create_ticket } from "./api.js";

let inventoryItems = [];
let selectedItems = [];

// Initialize
document.addEventListener("DOMContentLoaded", async () => {
  setupInventorySearch();
  setupSubmitButton();

  try {
    const data = await get_all_items();
    // Assuming Zoho Inventory item response structure: data.items array
    if (data && data.items) {
      inventoryItems = data.items;
      console.log("Items loaded:", inventoryItems.length);
    }
  } catch (error) {
    console.error("Error fetching inventory items:", error);
  }
});

function setupInventorySearch() {
  const searchInput = document.getElementById("search-input");
  const suggestionsBox = document.getElementById("suggestions");
  const btnAddManual = document.getElementById("btn-add-manual");

  if (btnAddManual) {
    btnAddManual.addEventListener("click", () => {
      const term = searchInput.value.trim();
      if (!term) {
        Swal.fire({
          icon: "warning",
          title: "Atención",
          text: "Por favor, escriba el nombre del artículo a solicitar en el buscador.",
          confirmButtonColor: "#0050d2",
        });
        return;
      }

      const customItem = {
        item_id: "custom-" + Date.now(),
        name: term + " (No Registrado)",
        available_stock: 0,
      };

      addItemToTable(customItem);
      searchInput.value = "";
      suggestionsBox.style.display = "none";
    });
  }

  searchInput.addEventListener("input", (e) => {
    const term = e.target.value.toLowerCase().trim();
    suggestionsBox.innerHTML = "";

    if (!term) {
      suggestionsBox.style.display = "none";
      return;
    }

    const filtered = inventoryItems
      .filter(
        (item) =>
          item.name.toLowerCase().includes(term) ||
          (item.sku && item.sku.toLowerCase().includes(term)),
      )
      .slice(0, 10); // Show max 10 suggestions

    if (filtered.length > 0) {
      suggestionsBox.style.display = "block";
      filtered.forEach((item) => {
        const div = document.createElement("div");
        div.className = "suggestion-item";
        div.textContent = `${item.name} (${item.available_stock || 0} en stock)`;
        div.addEventListener("click", () => {
          addItemToTable(item);
          searchInput.value = "";
          suggestionsBox.style.display = "none";
        });
        suggestionsBox.appendChild(div);
      });
    } else {
      suggestionsBox.style.display = "none";
    }
  });

  // Hide suggestions when clicking outside
  document.addEventListener("click", (e) => {
    if (e.target !== searchInput && e.target !== suggestionsBox) {
      suggestionsBox.style.display = "none";
    }
  });
}

function addItemToTable(item) {
  // Check if already in table
  if (selectedItems.find((i) => i.item_id === item.item_id)) {
    Swal.fire({
      icon: "info",
      title: "Artículo duplicado",
      text: "El artículo ya está en la lista.",
      confirmButtonColor: "#0050d2",
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
    });
    return;
  }

  selectedItems.push(item);
  const tbody = document.querySelector("#items-table tbody");

  const tr = document.createElement("tr");
  tr.id = `row-${item.item_id}`;

  const stock = item.available_stock || 0;

  tr.innerHTML = `
    <td>${item.name}</td>
    <td>${stock}</td>
    <td>
      <input type="number" min="1" max="${stock > 0 ? stock : ""}" class="item-qty" value="1" style="width: 70px;" data-id="${item.item_id}" />
    </td>
    <td>
      <button class="btn-delete" data-id="${item.item_id}">❌</button>
    </td>
  `;

  // Attach delete event
  tr.querySelector(".btn-delete").addEventListener("click", (e) => {
    const id = e.target.getAttribute("data-id");
    selectedItems = selectedItems.filter((i) => i.item_id !== id);
    tr.remove();
  });

  tbody.appendChild(tr);
}

function setupSubmitButton() {
  const submitBtn = document.getElementById("btn-submit");

  submitBtn.addEventListener("click", async () => {
    // Basic validation
    const contactName = document.getElementById("contactName").value.trim();
    const subject = document.getElementById("subject").value.trim();
    const status = document.getElementById("status").value;
    const departmentId = document.getElementById("departmentId").value;
    const cf_departamento_solicitante = document.getElementById(
      "cf_departamento_solicitante",
    ).value;
    const cf_fecha_requerida =
      document.getElementById("cf_fecha_requerida").value;
    const cf_motivo_de_solicitud = document
      .getElementById("cf_motivo_de_solicitud")
      .value.trim();

    if (
      !contactName ||
      !subject ||
      !cf_fecha_requerida ||
      !cf_motivo_de_solicitud
    ) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Por favor complete todos los campos obligatorios.",
        confirmButtonColor: "#0050d2",
      });
      return;
    }

    if (selectedItems.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Sin artículos",
        text: "Debe seleccionar al menos un artículo.",
        confirmButtonColor: "#0050d2",
      });
      return;
    }

    // Build articles string for multiline custom field
    const qtyInputs = document.querySelectorAll(".item-qty");
    let articulosString = "";
    let hasInvalidQty = false;
    let totalQuantity = 0;

    qtyInputs.forEach((input) => {
      const id = input.getAttribute("data-id");
      const item = selectedItems.find((i) => i.item_id === id);
      const qty = parseInt(input.value) || 0;

      if (qty <= 0) hasInvalidQty = true;
      totalQuantity += qty;

      const stock = item.available_stock || 0;
      // Format: "Name - Cantidad Requerida: X - Stock Disponible: Y\n"
      articulosString += `ID:${item.item_id} - ${item.name} - Cantidad Requerida: ${qty} - Stock: ${stock}|`;
    });

    if (hasInvalidQty) {
      Swal.fire({
        icon: "error",
        title: "Cantidades inválidas",
        text: "Por favor ingrese cantidades válidas (mayores a 0) para todos los artículos.",
        confirmButtonColor: "#0050d2",
      });
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Enviando...";

    // Build the payload
    // Note: Adjust the exact JSON fields according to the expected Zoho API payload
    const ticketPayload = {
      subject: subject,
      departmentId: "1307304000000006907",
      contactId: "1307304000000471001", // Should Ideally come from search, hardcoded from JSON as example
      status: status,
      email: "dionyjunior11@gmail.com", // Example from json
      channel: "Web",
      classification: "Others",
      priority: "High",
      cf: {
        cf_departamento_solicitante: cf_departamento_solicitante,
        cf_fecha_requerida: cf_fecha_requerida,
        cf_motivo_de_solicitud: cf_motivo_de_solicitud,
        cf_articulos: articulosString,
        cf_productos: null,
        cf_cantidad: totalQuantity.toString(),
      },
    };

    try {
      const response = await create_ticket(ticketPayload);
      console.log("Ticket Response:", response);

      Swal.fire({
        icon: "success",
        title: "¡Ticket Creado!",
        html: `Ticket generado y enviado con éxito.<br><a href="${response.webUrl}" target="_blank" style="color: #0050d2; text-decoration: none; font-weight: bold;">Ver Ticket en Zoho Desk</a>`,
        confirmButtonColor: "#0050d2",
        confirmButtonText: "Aceptar",
      });

      // Reset form
      document.getElementById("contactName").value = "";
      document.getElementById("subject").value = "";
      document.getElementById("cf_fecha_requerida").value = "";
      document.getElementById("cf_motivo_de_solicitud").value = "";
      document.getElementById("search-input").value = "";
      document.querySelector("#items-table tbody").innerHTML = "";
      selectedItems = [];
    } catch (error) {
      console.error("Error creating ticket:", error);
      Swal.fire({
        icon: "error",
        title: "Error de envío",
        text: "Ocurrió un error en el envío. Consulte la consola para más detalles.",
        confirmButtonColor: "#0050d2",
      });
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Registrar Ticket en Petromovil";
    }
  });
}
