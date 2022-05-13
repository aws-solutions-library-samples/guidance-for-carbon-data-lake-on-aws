export default class DataProvider {
  getData(name, callback) {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState === 4 && this.status === 200) {
        callback(JSON.parse(this.responseText));
      }
    };
    xhttp.open('GET', `./${name}.json`, true);
    xhttp.send();
  }
}
