document.addEventListener("DOMContentLoaded", () => {
    // Ophalen van opgeslagen data uit localStorage
    const savedData = JSON.parse(localStorage.getItem("products")) || [];
    const savedStaff = JSON.parse(localStorage.getItem("staffSales")) || {};
    const savedTransactions = JSON.parse(localStorage.getItem("transactions")) || [];
  
    const products = savedData.length
      ? savedData
      : [
          { name: "Vitamine A", pricePerUnit: 450, pricePer64: 28800, sold: 0, cost: 0 },
          { name: "Vitamine B", pricePerUnit: 700, pricePer64: 44800, sold: 0, cost: 0 },
          { name: "Vitamine C", pricePerUnit: 900, pricePer64: 57600, sold: 0, cost: 0 },
        ];
  
    const staffSales = savedStaff;
  
    // Functie om de tabel dynamisch te vullen
    const renderTable = () => {
      const tableBody = document.getElementById("product-table-body");
      tableBody.innerHTML = ""; // Clear de huidige inhoud
  
      products.forEach((product, index) => {
        const row = document.createElement("tr");
  
        row.innerHTML = `
          <td>${product.name}</td>
          <td>€ ${product.pricePerUnit.toFixed(2)}</td>
          <td>€ ${product.cost.toFixed(2)}</td>
          <td>€ ${product.pricePer64.toFixed(2)}</td>
          <td id="total-sold-${index}">${product.sold}</td>
          <td>${Math.floor(product.sold / 64)}</td>
          <td>
            <input 
              type="number" 
              class="form-control form-control-sm quantity-input" 
              min="0" 
              id="input-quantity-${index}" 
              placeholder="Aantal" 
              value="0" 
            />
          </td>
          <td id="price-${index}">€ 0.00</td>
        `;
  
        // Voeg event listener toe aan het inputveld
        row.querySelector(`#input-quantity-${index}`).addEventListener("input", (e) => {
          const quantity = parseInt(e.target.value) || 0;
          const totalPrice = quantity * product.pricePerUnit;
          document.getElementById(`price-${index}`).textContent = `€ ${totalPrice.toFixed(2)}`;
          updateTotals();
        });
  
        tableBody.appendChild(row);
      });
    };
  
    // Functie om totale waarden bij te werken
    const updateTotals = () => {
      let totalRevenue = 0;
      let totalCost = 0;
  
      document.querySelectorAll(".quantity-input").forEach((input, index) => {
        const quantity = parseInt(input.value) || 0;
        const product = products[index];
  
        totalRevenue += quantity * product.pricePerUnit;
        totalCost += quantity * product.cost;
      });
  
      const profit = totalRevenue - totalCost;
  
      // Update de velden
      document.getElementById("total-revenue").textContent = `€ ${totalRevenue.toFixed(2)}`;
      document.getElementById("customer-payment").textContent = `€ ${totalRevenue.toFixed(2)}`;
      document.getElementById("total-cost").textContent = `€ ${totalCost.toFixed(2)}`;
      document.getElementById("profit").textContent = `€ ${profit.toFixed(2)}`;
    };
  
    // Functie om verkopen per personeelslid netjes weer te geven
    const renderStaffSales = () => {
      const staffSalesList = document.getElementById("staff-sales-list");
      staffSalesList.innerHTML = ""; // Reset de lijst
  
      for (const staff in staffSales) {
        const sales = Object.entries(staffSales[staff])
          .filter(([_, quantity]) => quantity > 0) // Alleen producten met een positieve verkoop
          .map(
            ([product, quantity]) =>
              `<li>${product}: <strong>${quantity} verkocht</strong></li>`
          )
          .join("");
  
        if (sales) {
          const staffItem = document.createElement("div");
          staffItem.className = "mb-3";
  
          staffItem.innerHTML = `
            <h5>${staff}</h5>
            <ul class="list-group">
              ${sales}
            </ul>
          `;
          staffSalesList.appendChild(staffItem);
        }
      }
    };
  
    // Functie om transacties weer te geven
    const renderTransactions = () => {
      const transactionList = document.createElement("ul");
      transactionList.className = "list-group mt-3";
  
      savedTransactions.forEach((transaction) => {
        const transactionItem = document.createElement("li");
        transactionItem.className = "list-group-item";
        transactionItem.textContent = `Personeelslid: ${transaction.staffName} - ${transaction.productName} - Verdiend: €${transaction.earned.toFixed(2)}`;
        transactionList.appendChild(transactionItem);
      });
  
      document.querySelector(".container").appendChild(transactionList);
    };
  
    // Functie om gegevens in localStorage op te slaan
    const saveData = () => {
      localStorage.setItem("products", JSON.stringify(products));
      localStorage.setItem("staffSales", JSON.stringify(staffSales));
      localStorage.setItem("transactions", JSON.stringify(savedTransactions));
    };
  
    // Betalen-knop functionaliteit
    document.getElementById("pay-button").addEventListener("click", () => {
      const customerName = document.getElementById("customer-name").value.trim();
      const staffName = document.getElementById("staff-name").value.trim();
  
      if (customerName === "") {
        alert("Voer een klantnaam in!");
        return;
      }
  
      if (staffName === "") {
        alert("Voer de naam van het personeelslid in!");
        return;
      }
  
      let totalRevenue = 0;
  
      // Verwerk de ingevoerde hoeveelheden
      document.querySelectorAll(".quantity-input").forEach((input, index) => {
        const quantity = parseInt(input.value) || 0;
  
        if (quantity > 0) {
          const product = products[index];
          const earned = quantity * product.pricePerUnit;
  
          totalRevenue += earned;
          product.sold += quantity;
  
          if (!staffSales[staffName]) {
            staffSales[staffName] = {};
          }
          staffSales[staffName][product.name] = (staffSales[staffName][product.name] || 0) + quantity;
  
          savedTransactions.push({
            staffName,
            productName: product.name,
            earned,
          });
        }
  
        input.value = ""; // Reset de inputvelden
        document.getElementById(`price-${index}`).textContent = "€ 0.00";
      });
  
      // Update "Totaal verkocht"
      renderTable();
      renderStaffSales();
      renderTransactions();
      saveData();
      updateTotals();
  
      // Genereer het betalingscommando
      const command = `/pin set ${customerName} €${totalRevenue.toFixed(2)}`;
      document.getElementById("generated-command").value = command;
  
      // Kopieer naar klembord
      navigator.clipboard.writeText(command).then(() => {
        alert("Betalingsopdracht gekopieerd naar het klembord!");
      });
    });
  
    // Initialiseer de tabel, verkopen en transacties
    renderTable();
    renderStaffSales();
    //renderTransactions();
    updateTotals();
  });
  