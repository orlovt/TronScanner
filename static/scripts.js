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
                    color: "black",
                    width: 0.5
                },
                label: allLabels,
                customdata: hoverData,
                hovertemplate: '%{customdata}<extra></extra>',
                color: "blue"
            },
            link: {
                source: mappedSources,
                target: mappedTargets,
                value: values,
                color: linkColors, 
                hovertemplate: '%{value:,} USDT<extra></extra>', 
            }};
    var layout = {
            title: {
                text: "Sankey Graph of Inbound and Outbound Transactions",
                font: {
                    size: 16
                }
            },
            font: {
                size: 12,
                color: 'black'
            },
            plot_bgcolor: "#f4f4f4",
            paper_bgcolor: "#f4f4f4",
    };
    Plotly.newPlot('myDiv', [sankeyData], layout);
}
