function getInputValues() {
    return {
        nboundDepth: parseInt(document.getElementById("nboundDepth").value, 10),
        outboundDepth: parseInt(document.getElementById("outboundDepth").value, 10),
        limit: parseInt(document.getElementById("limit").value, 10),
        address: document.getElementById("address").value,
        fromDate: document.getElementById("fromDate").value,
        tillDate: document.getElementById("tillDate").value
    };
}

function formatLabel(address) {
    return `${address.slice(0, 3)}...${address.slice(-3)}`;
}

function computeFlows(labels, sources, targets, values) {
    const inflows = new Map();
    const outflows = new Map();

    sources.forEach((source, index) => {
        outflows.set(source, (outflows.get(source) || 0) + values[index]);
    });
    targets.forEach((target, index) => {
        inflows.set(target, (inflows.get(target) || 0) + values[index]);
    });
    return { inflows, outflows };
}

const pieColors = [
    '#e0e0e0', '#2c3e50', '#2c2c2c', '#3a3a3a', '#4a4a4a', 
    '#3c4e70', '#1c1c1c', '#5c5c5c', '#4c5e80', '#6c6c6c', 
    '#0c0c0c', '#7c7c7c', '#5c6e90', '#8c8c8c', '#9c9c9c',
    '#acacac', '#bcbcbc', '#ccdcdc', '#dcdcdc', '#ececec'
];

function getColorBasedOnValue(value, maxVal) {
    const ratio = value / maxVal;

    // Define the RGB values for the start and end colors
    const startColor = { r: 44, g: 62, b: 80 };  // #2c3e50
    const endColor = { r: 224, g: 224, b: 224 };  // #e0e0e0
    // Interpolate the RGB values based on the ratio
    const red = Math.floor(startColor.r + (endColor.r - startColor.r) * ratio);
    const green = Math.floor(startColor.g + (endColor.g - startColor.g) * ratio);
    const blue = Math.floor(startColor.b + (endColor.b - startColor.b) * ratio);
    return `rgba(${red}, ${green}, ${blue}, 0.79)`;
}


function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'decimal',
        maximumFractionDigits: 0,
        minimumFractionDigits: 0
    }).format(value) + " USDT";
}

function fetchData() {
    const {
        nboundDepth,
        outboundDepth,
        limit,
        address,
        fromDate,
        tillDate
    } = getInputValues();
    document.getElementById("loading").style.display = "block";
    fetch("/getdata", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            nboundDepth, outboundDepth, limit, address, fromDate, tillDate
        })
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById("loading").style.display = "none";
        // Extract relevant transactions and render the table
        const relevantTransactions = extractRelevantTransactions(data);
        renderTransactionsTable(relevantTransactions);  // New function to render the transactions table
        renderPieCharts(data);
        renderSankeyGraph(data);
    });
}

function renderSankeyGraph(data) {
    const { sources, targets, values } = data;
    const originalLabels = Array.from(new Set([...sources, ...targets]));
    const allLabels = originalLabels.map(formatLabel);
    const mappedSources = sources.map(source => allLabels.indexOf(formatLabel(source)));
    const mappedTargets = targets.map(target => allLabels.indexOf(formatLabel(target)));
    const { inflows, outflows } = computeFlows(originalLabels, sources, targets, values);
    const maxVal = Math.max(...values);
    const linkColors = values.map(value => getColorBasedOnValue(value, maxVal));
    const hoverData = originalLabels.map(label => `${label}<br>Inflow: ${formatCurrency(inflows.get(label))}<br>Outflow: ${formatCurrency(outflows.get(label))} <br> NetDiff: ${formatCurrency(inflows.get(label) - outflows.get(label))}`);
    
    var sankeyData = {
            type: "sankey",
            orientation: "h",
            valueformat: ".0f",
            valuesuffix: " USDT",
            node: {
                pad: 20,
                thickness: 20,
                line: {
                    color: "#4a4a4a", 
                    width: 0.5
                },
                label: allLabels,
                customdata: hoverData,
                hovertemplate: '%{customdata}<extra></extra>',
                color: "#337ab7"  // Updated node color
            },
            labelFont: {
                color: "#FFFFFF",  // Updated font color to white
                size: 18  // Increased font size
            }, 
            link: {
                source: mappedSources,
                target: mappedTargets,
                value: values,
                color: linkColors, 
                hovertemplate: '%{value:,} USDT<extra></extra>'
            }};
            var layout = {
                title: {
                    text: "Sankey Graph of Inbound and Outbound Transactions",
                    font: {
                        size: 16,
                        family: "'Roboto Mono', monospace",  // Updated font
                        color: '#e0e0e0'  // Updated color
                    }
                },
                font: {
                    family: "'Roboto Mono', monospace",
                    size: 14,
                    color: '#e0e0e0'  
                },
                plot_bgcolor: "#1e1e1e",  // Updated background color
                paper_bgcolor: "#1e1e1e",  // Updated paper background color
        };
    Plotly.newPlot('myDiv', [sankeyData], layout);
}


function renderPieCharts(data) {
    const { sources, targets, values } = data;

    // Dynamically fetching the address in focus (our address):
    const ourAddress = document.getElementById("address").value;

    // Preprocessing for Outbound Pie Chart
    const outboundValues = {};
    sources.forEach((source, idx) => {
        if (source === ourAddress) {
            if (!outboundValues[targets[idx]]) {
                outboundValues[targets[idx]] = 0;
            }
            outboundValues[targets[idx]] += values[idx];
        }
    });

    const outboundLabels = Object.keys(outboundValues);
    const outboundAmounts = Object.values(outboundValues);

    // Preprocessing for Inbound Pie Chart
    const inboundValues = {};
    targets.forEach((target, idx) => {
        if (target === ourAddress) {
            if (!inboundValues[sources[idx]]) {
                inboundValues[sources[idx]] = 0;
            }
            inboundValues[sources[idx]] += values[idx];
        }
    });

    const inboundLabels = Object.keys(inboundValues);
    const inboundAmounts = Object.values(inboundValues);
    
    // Pie chart data for outbound and inbound transactions
    const outboundData = {
        
        values: outboundAmounts,
        labels: outboundLabels,
        type: 'pie',
        name: 'Outbound',
        domain: { x: [0.25, 0.525] },  // This makes it occupy the left half of the grid
        title: 'Outbound Transactions', 
        marker: {
            colors: pieColors
        }
    };

    const inboundData = {
        values: inboundAmounts,
        labels: inboundLabels,
        type: 'pie',
        name: 'Inbound',
        domain: { x: [0.575, 0.825] },  // This makes it occupy the right half of the grid
        title: 'Inbound Transactions', 
        marker: {
            colors: pieColors
        }
    };

    const layout = {
        title: {
            text: "Transactions Overview",
            pad: { bottom: 20 }, 
            font: {
                size: 16,
                family: "'Roboto Mono', monospace",  // Updated font
                color: '#e0e0e0'  // Updated color
            }
        },
        font: {
            family: "'Roboto Mono', monospace",
            size: 14,
            color: '#e0e0e0'  
        }, 
        plot_bgcolor: "#1e1e1e",  // Updated background color
        paper_bgcolor: "#1e1e1e",  // Updated paper background color
    };

    // Plotting the pie charts side by side using subplot functionality
    Plotly.newPlot('pieChartsContainer', [outboundData, inboundData], layout);
}

function extractRelevantTransactions(data) {
    const transfers = data.transactions.data.tron.transfers;
    const relevantTransfers = transfers.filter(transaction => {
        return transaction.currency.symbol === "TRX" || transaction.currency.symbol === "USDT";
    });

    return relevantTransfers.map(transaction => {
        return {
            senderAddress: transaction.address.address,
            receiverAddress: transaction.receiver.address,
            amount: transaction.amount,
            currencySymbol: transaction.currency.symbol,
            timestamp: transaction.block.timestamp.time
        };
    });
}

function renderTransactionsTable(transactions) {
    let table = "<table border='1'>";
    table += "<thead><tr><th>Timestamp</th><th>Address</th><th>Currency</th><th>Amount</th></tr></thead>";
    table += "<tbody>";

    transactions.forEach(transaction => {
        table += `<tr><td>${transaction.timestamp}</td><td>${transaction.senderAddress} -> ${transaction.receiverAddress}</td><td>${transaction.currencySymbol}</td><td>${transaction.amount}</td></tr>`;
    });

    table += "</tbody></table>";

    // Insert the table into a container. Make sure you have a container with the ID "transactionsTableContainer" in your HTML.
    $("#transactionsTableContainer").html(table);
}


