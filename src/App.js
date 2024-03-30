import React from 'react';
import * as XLSX from 'xlsx';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userInfo: {},
      schedule: [],
      searchQuery: ''
    };
  }

  componentDidMount() {
    // Excel dosyasını yükleme
    fetch('/shiftM.xlsx')
      .then(response => response.blob())
      .then(blob => {
        // Blob'u okuyun
        const reader = new FileReader();
        reader.onload = () => {
          // Excel dosyasını işleyin
          const data = new Uint8Array(reader.result);
          const workbook = XLSX.read(data, { type: 'array' });
          // İlk sayfayı alın
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          // JSON'a dönüştürme
          const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
          // Kullanıcı bilgilerini ayrı bir nesneye ata
          const userInfo = {
            sicil: jsonData[1][0],
            adSoyad: jsonData[1][1],
            departman: jsonData[1][2],
            gorev: jsonData[1][3],
            ekip: jsonData[1][4],
            servis: jsonData[1][5],
            skill: jsonData[1][6]
          };
          // Tarihleri gün, ay ve yıl olarak dönüştürme ve state'i güncelleme
          const formattedData = jsonData.slice(1);
          // State'i güncelleme
          this.setState({ userInfo, schedule: formattedData });
        };
        reader.readAsArrayBuffer(blob);
      });
  }

  handleSearchChange = event => {
    this.setState({ searchQuery: event.target.value });
  };

  render() {
    const filteredSchedule = this.state.schedule.filter(row => {
      const [date] = row;
      return String(date).includes(this.state.searchQuery);
    });
    const offDays = filteredSchedule.filter(row => row[1] === 'OFF');
    const offDaysCount = offDays.length;

    return (
      <div className='container'>
        {/* Kullanıcı bilgilerini gösteren kart */}
        <div className="card mt-5">
          <div className="card-body bg-dark text-white">
            <h5 className="card-title">Kullanıcı Bilgileri</h5>
            <p>Sicil: {this.state.userInfo.sicil}</p>
            <p>Ad Soyad: {this.state.userInfo.adSoyad}</p>
            <p>Departman: {this.state.userInfo.departman}</p>
            <p>Görev: {this.state.userInfo.gorev}</p>
            <p>Ekip: {this.state.userInfo.ekip}</p>
            <p>Servis: {this.state.userInfo.servis}</p>
            <p>Skill: {this.state.userInfo.skill}</p>
          </div>
        </div>

        {/* Arama kutusu */}
        <div className="mt-5">
          <input
            type="text"
            className="form-control"
            placeholder="Tarihi arayın..."
            value={this.state.searchQuery}
            onChange={this.handleSearchChange}
          />
        </div>
        {/* Çalışma programını gösteren tablo */}
        <h1 className='my-5 text-center'>Çalışma Programı</h1>
        <p className='text-center font-weight-bold'>Toplam <span>{offDaysCount}</span> gün OFF</p>
        <table className="table table-dark table-striped-columns">
          <thead>
            <tr>
              <th>Tarih</th>
              <th>Çalışma Saatleri</th>
            </tr>
          </thead>
          <tbody>
            {filteredSchedule.map((row, index) => (
              <tr key={index}>
                <td style={{backgroundColor: row[1] === 'OFF' ? 'orange' : 'inherit', fontWeight: 'bold'}}>{row[0]}</td>
                <td style={{backgroundColor: row[1] === 'OFF' ? 'orange' : 'inherit', fontWeight: 'bold'}}>{row[1]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

export default App;