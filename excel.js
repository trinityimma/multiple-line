const svg = d3.select("svg");
const height = +svg.attr("height");
const width = +svg.attr("width");
const margin = { top: 50, right: 40, bottom: 80, left: 100 };
let excelData = "";

const plotChartBtn = document.getElementById("plot-chart");

plotChartBtn.addEventListener("click", () => {
  excelData.forEach((d) => {
    d.oil_prod = +d["MonthlyOIL (stb)"];
    d.Date = new Date(d.Date);
  });
  console.log(excelData);
  // plotChart(excelData, "Name", "Experience");
});

const plotChart = (data, xValueKey, yValueKey) => {
  const xValue = (d) => d[xValueKey];
  const xAxisLabel = "Country";

  const yValue = (d) => d[yValueKey];
  const yAxisLabel = "Populaation";

  const chartLabel = "Country's Population";

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.right;

  const xScale = d3
    .scaleBand()
    .domain(data.map(xValue))
    .range([0, innerWidth])
    .padding(0.3);

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, yValue)])
    .range([innerHeight, 0])
    .nice();

  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  const xAxis = d3.axisBottom(xScale);
  // .tickSize(-innerHeight).tickPadding(10);

  const xAxisG = g
    .append("g")
    .call(xAxis)
    .attr("transform", `translate(0, ${innerHeight})`);

  xAxisG
    .append("text")
    .attr("y", 60)
    .attr("x", innerWidth / 2)
    .attr("fill", "black")
    .text(xAxisLabel);

  const yAxis = d3.axisLeft(yScale);
  // .tickSize(-innerWidth).tickPadding(10);

  const yAxisG = g.append("g").call(yAxis);

  yAxisG
    .append("text")
    .attr("y", -85)
    .attr("x", -innerHeight / 2)
    .attr("fill", "black")
    .attr("transform", `rotate(-90)`)
    .attr("text-anchor", "middle")
    .text(yAxisLabel);

  g.selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("fill", "steelblue")
    .attr("x", (d) => xScale(xValue(d)))
    .attr("y", (d) => yScale(yValue(d)))
    .attr("height", (d) => {
      return innerHeight - yScale(yValue(d));
    })
    .attr("width", xScale.bandwidth());

  g.append("text")
    .attr("y", -20)
    .attr("x", innerWidth / 2)
    .text(chartLabel);
};

function upload(excelData) {
  console.log("Uploading ...");
  //Reference the FileUpload element.
  var fileUpload = document.getElementById("fileUpload");

  //Validate whether File is valid Excel file.
  var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.xls|.xlsx)$/;
  if (regex.test(fileUpload.value.toLowerCase())) {
    if (typeof FileReader != "undefined") {
      var reader = new FileReader();

      //For Browsers other than IE.
      if (reader.readAsBinaryString) {
        reader.onload = function (e) {
          ProcessExcel(e.target.result);
        };
        reader.readAsBinaryString(fileUpload.files[0]);
      } else {
        //For IE Browser.
        reader.onload = function (e) {
          var data = "";
          var bytes = new Uint8Array(e.target.result);
          for (var i = 0; i < bytes.byteLength; i++) {
            data += String.fromCharCode(bytes[i]);
          }
          ProcessExcel(data);
        };
        reader.readAsArrayBuffer(fileUpload.files[0]);
      }
    } else {
      alert("This browser does not support HTML5.");
    }
  } else {
    alert("Please upload a valid Excel file.");
  }
}

function ProcessExcel(data) {
  //Read the Excel File data.
  var workbook = XLSX.read(data, {
    type: "binary",
  });

  //Fetch the name of First Sheet.
  var firstSheet = workbook.SheetNames[0];

  //Read all rows from First Sheet into an JSON array.
  var excelRows = XLSX.utils.sheet_to_row_object_array(
    workbook.Sheets[firstSheet]
  );

  excelData = excelRows;
  console.log(excelData);
  // createTable(excelRows);
}

function createTable(excelRows) {
  //Create a HTML Table element.
  var table = document.createElement("table");
  table.border = "1";

  //Add the header row.
  var row = table.insertRow(-1);

  //Add the header cells.
  var headerCell = document.createElement("TH");
  headerCell.innerHTML = "ID";
  row.appendChild(headerCell);

  headerCell = document.createElement("TH");
  headerCell.innerHTML = "Name";
  row.appendChild(headerCell);

  headerCell = document.createElement("TH");
  headerCell.innerHTML = "Post";
  row.appendChild(headerCell);

  headerCell = document.createElement("TH");
  headerCell.innerHTML = "Experience";
  row.appendChild(headerCell);

  //Add the data rows from Excel file.
  for (var i = 0; i < excelRows.length; i++) {
    //Add the data row.
    var row = table.insertRow(-1);

    //Add the data cells.
    var cell = row.insertCell(-1);
    cell.innerHTML = excelRows[i].ID;

    cell = row.insertCell(-1);
    cell.innerHTML = excelRows[i].Name;

    cell = row.insertCell(-1);
    cell.innerHTML = excelRows[i].Post;

    cell = row.insertCell(-1);
    cell.innerHTML = excelRows[i].Experience;
  }

  var dvExcel = document.getElementById("dvExcel");
  dvExcel.innerHTML = "";
  dvExcel.appendChild(table);
}
