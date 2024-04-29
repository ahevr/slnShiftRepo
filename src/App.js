import React from 'react';
import * as XLSX from 'xlsx';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userInfo: {},
      schedule: [],
      searchQuery: '',
      todayShift: '',
      greeting: ''
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
          const formattedData = jsonData.slice(2).map(row => {
            const [rawDate, workingHours] = row.slice(0, 2); // Çalışma saatlerini al
            const date = this.excelDateToJSDate(rawDate);
            return [date.toLocaleDateString(), workingHours, row[2]]; // Çalışma saatleri ekleniyor
          });

          // Bugünkü vardiyayı ve selamlamayı alın
          const today = new Date();
          const todayDate = today.toLocaleDateString();
          const todayTime = today.toLocaleTimeString();
          // const todayShift = formattedData.find(([date]) => date === todayDate)[2];
          const greeting = this.getGreeting(todayTime);
          // State'i güncelleme
          // this.setState({ userInfo, schedule: formattedData, todayShift, greeting });
          this.setState({ userInfo, schedule: formattedData, greeting });
        };
        reader.readAsArrayBuffer(blob);
      });
  }
  // Excel'deki tarih sayısını gerçek bir tarihe dönüştürme
  excelDateToJSDate(excelDate) {
    return new Date((excelDate - (25567 + 2)) * 86400 * 1000);
  }

  // Saate göre selamlama mesajını döndürme işlevi
  getGreeting(time) {
    const hour = parseInt(time.split(':')[0]);
    if (hour >= 6 && hour < 12) {
      return 'Günaydın';
    } else if (hour >= 12 && hour < 18) {
      return 'İyi günler';
    } else if (hour >= 18 && hour < 22) {
      return 'İyi akşamlar';
    } else {
      return 'İyi geceler';
    }
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
    // const { schedule, todayShift, greeting } = this.state;
    const { schedule, greeting } = this.state;
    const totalDataCount = schedule.length;
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date().toLocaleDateString('tr-TR', options);


    return (
      <div className='container'>
        {/* <div className="card mt-5">
          <div className="card-body bg-dark text-white">
            <h5 className="card-title">Kullanıcı Bilgileri</h5>
            <p style={{fontSize: '14px'}} >Sicil: {this.state.userInfo.sicil}</p>
            <p style={{fontSize: '14px'}} >Ad Soyad: {this.state.userInfo.adSoyad}</p>
            <p style={{fontSize: '14px'}} >Departman: {this.state.userInfo.departman}</p>
            <p style={{fontSize: '14px'}} >Görev: {this.state.userInfo.gorev}</p>
            <p style={{fontSize: '14px'}} >Ekip: {this.state.userInfo.ekip}</p>
            <p style={{fontSize: '14px'}} >Servis: {this.state.userInfo.servis}</p>
          </div>
        </div> */}
        {/* Arama kutusu */}
        <div className="mt-5">
          <input
            type="text"
            style={{ height: '50px' }}
            className="form-control"
            placeholder="Tarihi arayın..."
            value={this.state.searchQuery}
            onChange={this.handleSearchChange}
          />
        </div>
        {/* Çalışma programını gösteren tablo */}
        <h1 className='my-5 text-center'>Çalışma Programı</h1>
        <p className='text-center font-weight-bold'>Toplam Çalışılacak Gün Sayısı: <span style={{ fontSize: '20px', color: 'orange' }}>{totalDataCount - offDaysCount}</span>  </p>
        <p className='text-center font-weight-bold'>Toplam <span style={{ color: 'orange', fontSize: '20px' }}>{offDaysCount}</span> gün OFF</p>
        <p className='text-center font-weight-bold'>
          {/* <span style={{ fontSize: '13px' }}>Merhaba {this.state.userInfo.adSoyad} {greeting} <br/> Bugün günlerden {today} <br/> bugünkü vardiyanız: {todayShift}</span> */}
          <span style={{ fontSize: '13px' }}>Merhaba {this.state.userInfo.adSoyad} {greeting} <br/> Bugün günlerden {today} <br/></span>
        </p>
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
                <td>
                  <span
                    style={{
                      textDecoration: new Date(row[0].replace(/\./g, '/')) < new Date() ? '' : 'none',
                      backgroundColor: row[1] === 'OFF' ? 'orange' : '',
                      fontWeight: 'bold'
                    }}
                  >
                    {row[0]}
                  </span>
                </td>
                <td style={{ backgroundColor: row[1] === 'OFF' ? 'orange' : '', fontWeight: 'bold' }}>{row[1]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

export default App;
