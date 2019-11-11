function addRow(table, cellType, values) {
  const row = document.createElement('tr');
  for (let i = 0; i < values.length; i++) {
    const val = values[i];
    const cell = document.createElement(cellType);
    const text = document.createTextNode(val);
    cell.appendChild(text);
    row.appendChild(cell);
  }
  table.appendChild(row);
}

function detectedObjectsTable(detectedObjects, parent) {
  if (detectedObjects.length > 0) {
    const table = document.createElement('table');

    addRow(table, 'th', ['Class', 'Confidence Score']);

    for (let i = 0; i < detectedObjects.length; i++) {
      const obj = detectedObjects[i];
      const label = obj['class'];
      const conf = obj['score'].toFixed(3);

      addRow(table, 'td', [label, conf]);
    }
    parent.appendChild(table);
  }
}

window.addEventListener('load', function() {
  const article = document.querySelector('article');

  function populateArticle(jsonResult) {
    article.innerHTML = '';

    if (jsonResult.hasOwnProperty('data')) {

      let classified = jsonResult.data.classes;
      const myCount = document.createElement('h3');
      myCount.textContent = "Fetching the result";
      article.appendChild(myCount);
      detectedObjectsTable(classified, article);
    } else {
      const myDiv = document.createElement('div');
      myDiv.className = 'error';
      myDiv.id = 'error-div';
      const myTitle = document.createElement('h3');
      myTitle.textContent = 'ERROR';
      myDiv.appendChild(myTitle);
      for (const key in jsonResult) {
        if (jsonResult.hasOwnProperty(key)) {
          const myP = document.createElement('p');
          myP.textContent = key + ':  ' + jsonResult[key];
          myDiv.appendChild(myP);
        }
      }
      article.appendChild(myDiv);
    }
  }


  const raw = top.frames['mytarget'];
  const myTarget = document.getElementById('mytarget');
  if (myTarget) {
    myTarget.addEventListener('load', function() {
      let rawContent = raw.document.body.innerText;
      console.log(rawContent);
      let rawJson = JSON.parse(rawContent);
      console.log(rawJson);
      populateArticle(rawJson);
    });
  }

  // image preview
  document.getElementById("foo").addEventListener("change", imagePreview);
  function imagePreview() {
    let input = document.querySelector('input[type=file]');
    if (input.files && input.files[0]) {
      let fileReader = new FileReader();
      fileReader.onload = function () {
        const imagePreview = document.getElementById('imagePreview');
        imagePreview.src = fileReader.result;
        imagePreview.style = "display: block;";
      };

      fileReader.readAsDataURL(input.files[0]);
    }
  }
});
