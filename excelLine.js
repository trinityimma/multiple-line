const svg = d3.select("svg");
const height = +svg.attr("height");
const width = +svg.attr("width");
const margin = { top: 50, right: 40, bottom: 80, left: 100 };
let excelData = "";

const plotChartBtn = document.getElementById("plot-chart");

plotChartBtn.addEventListener("click", () => {
  excelData.forEach((d) => {
    d.Experience = +d.Experience;
  });
  excelData.forEach((d) => {
    d.oil_prod = +d["MonthlyOIL (stb)"];
    d.Date = new Date(d.Date);
  });
  console.log(excelData);
  plotChart(excelData, "Date", "oil_prod");
});

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
    .domain(d3.extent(data, xValue))
    .range([0, innerWidth]);
  // .nice();

  const yScale = d3
    .scaleLinear()
    .domain(d3.extent(data, yValue))
    .range([innerHeight, 0]);
  // .nice();

  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  const xAxis = d3.axisBottom(xScale);
  // .tickSize(-innerHeight).tickPadding(10);

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
  // .tickSize(-innerWidth).tickPadding(10);

  const yAxisG = g.append("g").attr("class", "axis").call(yAxis);

  yAxisG
    .append("text")
    .attr("y", -70)
    .attr("x", -innerHeight / 2)
    .attr("fill", "black")
    .attr("transform", `rotate(-90)`)
    .attr("text-anchor", "middle")
    .text(yAxisLabel);

  const sumstat = d3
    .nest()
    .key((d) => d["UNIQUEID"])
    .entries(data);

  console.log(sumstat);

  // set color pallete for different variables
  const drainageName = sumstat.map((d) => d["UNIQUEID"]);
  var color = d3.scaleOrdinal().domain(drainageName).range(colorbrewer.Set2[6]);

  // const lineGenerator = d3
  //   .line()
  //   .x((d) => xScale(xValue(d)))
  //   .y((d) => yScale(yValue(d)))
  // .curve(d3.curveBasis)(d.values);
  // .curve(d3.curveCardinal)(d.values);

  // g.append("path").attr("class", "line-path").attr("d", lineGenerator(sumstat));

  g.selectAll(".line")
    .append("g")
    .attr("class", "line")
    .data(sumstat)
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
  console.log("Uploaded!");
}
