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
    labels.forEach(label => {
        inflows.set(label, 0);
        outflows.set(label, 0);
    });
    sources.forEach((source, index) => outflows.set(source, (outflows.get(source) || 0) + values[index]));
    targets.forEach((target, index) => inflows.set(target, (inflows.get(target) || 0) + values[index]));
    return { inflows, outflows };
}

function getColorBasedOnValue(value, maxVal) {
    const ratio = value / maxVal;
    const red = Math.floor(255 * ratio);
    const blue = Math.floor(255 * (1 - ratio));
    return `rgba(${red * 0.9}, 0, ${blue * 0.9}, 0.79)`;
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
        renderSankeyGraph(data);
        renderPieCharts(data);
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
                color: "262626"
            },
            labelFont: {
                color: "#e0e0e0",  // Font color of the labels
                size: 16  // Font size of the labels
            }, 
            link: {
                source: mappedSources,
                target: mappedTargets,
                value: values,
                color: linkColors.map(color => color === "#2c3e50" ? "#3c4e70" : "#3a3a3a"),  // Adjusted colors
                hovertemplate: '%{value:,} USDT<extra></extra>', 
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
    const pieColors = [
        '#e0e0e0', // Primary text color
        '#2c3e50', // Accent color
        '#2c2c2c', // Secondary background color
        '#3a3a3a', // Border color
        '#4a4a4a', // Darker shade of border color
        '#3c4e70', // Darker shade of accent color
        '#1c1c1c', // Darker shade of primary background color
        '#5c5c5c', // Lighter shade of border color
        '#4c5e80', // Lighter shade of accent color
        '#6c6c6c', // Even lighter shade of border color
        '#0c0c0c', // Even darker shade of primary background color
        '#7c7c7c', // Another lighter shade of border color
        '#5c6e90'  // Another lighter shade of accent color
    ];
    

    // Pie chart data for outbound and inbound transactions
    const outboundData = {
        
        values: outboundAmounts,
        labels: outboundLabels,
        type: 'pie',
        name: 'Outbound',
        domain: { x: [0, 0.42] },  // This makes it occupy the left half of the grid
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
        domain: { x: [0.58, 1] },  // This makes it occupy the right half of the grid
        title: 'Inbound Transactions', 
        marker: {
            colors: pieColors
        }
    };

    const layout = {
        title: {
            text: "Transactions Overview",
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
        grid: {rows: 1, columns: 2},
        plot_bgcolor: "#1e1e1e",  // Updated background color
        paper_bgcolor: "#1e1e1e",  // Updated paper background color
    };

    // Plotting the pie charts side by side using subplot functionality
    Plotly.newPlot('pieChartsContainer', [outboundData, inboundData], layout);
}
