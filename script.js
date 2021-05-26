const svg = d3.select("svg");
const height = +svg.attr("height");
const width = +svg.attr("width");
const margin = { top: 50, right: 250, bottom: 80, left: 100 };
let excelData = "";
let groupData1 = "";
let groupData2 = "";
const checkValues = [];

const plotChartBtn = document.getElementById("plot-chart");

plotChartBtn.addEventListener("click", () => {
  getSelectedCheckboxValues();

  const plotData = [];

  checkValues.forEach((d) => {
    const data = groupData1.find((datum) => datum.key == d);
    plotData.push(data);
  });

  console.log(groupData1);
  console.log(plotData);
  plotChart(plotData, "Date", "oil_prod");
});

function toggleCheck() {
  if (this.checked) check();
  else check(false);
}

function check(checked = true) {
  const cbs = document.querySelectorAll(".nestedCheckbox");
  cbs.forEach((cb) => {
    cb.checked = checked;
  });
}

plotChart = (data, xValueKey, yValueKey) => {
  const xValue = (d) => d[xValueKey];
  const xAxisLabel = "Year";

  const yValue = (d) => d[yValueKey];
  const yAxisLabel = "Production (stb)";

  const chartLabel = "Monthly Oil Population";

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.right;

  const xScale = d3
    .scaleTime()
    .domain(d3.extent(excelData, xValue))
    .range([0, innerWidth]);
  // .nice();

  const yScale = d3
    .scaleLinear()
    .domain(d3.extent(excelData, yValue))
    .range([innerHeight, 0]);
  // .nice();

  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  const xAxis = d3.axisBottom(xScale);
  // .tickSize(-innerHeight);

  const xAxisG = g
    .append("g")
    .attr("class", "axis")
    .call(xAxis)
    .attr("transform", `translate(0, ${innerHeight})`);

  xAxisG
    .append("text")
    .attr("y", 40)
    .attr("x", innerWidth / 2)
    .attr("fill", "black")
    .text(xAxisLabel);

  const yAxis = d3.axisLeft(yScale);
  // .tickSize(-innerWidth);

  const yAxisG = g.append("g").attr("class", "axis").call(yAxis);

  yAxisG
    .append("text")
    .attr("y", -70)
    .attr("x", -innerHeight / 2)
    .attr("fill", "black")
    .attr("transform", `rotate(-90)`)
    .attr("text-anchor", "middle")
    .text(yAxisLabel);

  // set color pallete for different variables
  const drainageName = data.map((d) => d.well);
  var color = d3.scaleOrdinal().domain(drainageName).range(colorbrewer.Set2[6]);

  const fieldG = svg.selectAll(".fieldG").data(groupData2).enter().append("g");

  g.selectAll(".line")
    .append("g")
    .attr("class", "line")
    .data(data)
    .enter()
    .append("path")
    .attr("d", function (d) {
      return d3
        .line()
        .x((d) => xScale(xValue(d)))
        .y((d) => yScale(yValue(d)))
        .curve(d3.curveCardinal)(d.values);
    })
    .attr("fill", "none")
    .attr("stroke", (d) => color(d.key))
    .attr("stroke-width", 2);

  //append legends
  var legend = g
    .selectAll("g.legend")
    .data(data)
    .enter()
    .append("g")
    .attr("class", "legend");

  legend
    .append("circle")
    .attr("cx", innerWidth + 40)
    .attr("cy", (d, i) => i * 20 + 10)
    .attr("r", 6)
    .style("fill", (d) => color(d.key));

  legend
    .append("text")
    .attr("x", innerWidth + 70)
    .attr("y", (d, i) => i * 20 + 10)
    .text((d) => d.key);

  g.append("text")
    .attr("y", -20)
    .attr("class", "title")
    .attr("x", innerWidth / 3)
    .text(chartLabel);
};
groupData = () => {
  groupData1 = d3
    .nest()
    .key((d) => d["well"])
    .entries(excelData);

  groupData2 = d3
    .nest()
    .key((d) => {
      return d.field;
    })
    .key(function (d) {
      return d.well;
    })
    .entries(excelData);
};
function getSelectedCheckboxValues() {
  const checkboxes = document.querySelectorAll(`.nestedCheckbox:checked`);
  checkboxes.forEach((checkbox) => {
    checkValues.push(checkbox.value);
  });
  console.log(checkValues);
}

const createTreeView = () => {
  excelData.forEach((d) => {
    d.oil_prod = +d["MonthlyOIL (stb)"];
    d.Date = new Date(d.Date);
    const splitWord = d["UNIQUEID"].split(":");
    d.field = splitWord[1];
    d.well = splitWord[0];
  });

  console.log("Creating Treeview ....");
  groupData();

  const ul = document.querySelector("ul");

  groupData2.forEach((dataset) => {
    const li = document.createElement("li");
    const caretContainer = document.createElement("span");

    caretContainer.classList.add("caret");
    caretContainer.addEventListener("click", (e) => {
      e.target.parentElement
        .querySelector(".nested")
        .classList.toggle("active");
      e.target.classList.toggle("caret-down");
    });
    li.append(caretContainer);

    const checkbox = document.createElement("input");
    checkbox.setAttribute("type", "checkbox");
    checkbox.setAttribute("value", dataset.key);
    checkbox.classList.add("mycheckbox");
    li.append(checkbox);

    const span = document.createElement("span");
    li.append((span.innerHTML = dataset.key));

    ul.append(li);

    const ulNested = document.createElement("ul");
    ulNested.classList.add("nested");
    li.append(ulNested);

    dataset.values.forEach((wellData) => {
      const checkboxNested = document.createElement("input");
      // .addEventListener("click", addData(wellData.key))
      checkboxNested.setAttribute("type", "checkbox");
      checkboxNested.setAttribute("value", wellData.key);
      checkboxNested.classList.add("nestedCheckbox");
      const nestedLi = document.createElement("li");
      nestedLi.append(checkboxNested);
      nestedLi.append((span.innerHTML = wellData.key));

      ulNested.append(nestedLi);
    });
    // console.log(ul);
  });

  // d3.selectAll(".checkbox").on("change", update());
};

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
  console.log("Uploaded!");
  createTreeView();
}
function upload() {
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
