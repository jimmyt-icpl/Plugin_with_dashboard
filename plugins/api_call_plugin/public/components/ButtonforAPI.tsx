import React, {useState} from 'react';
import './ButtonStyle.scss';

function ExampleComponent() {
    const [data, setData] = useState(null);
  
    const handleButtonClick = async () => {
      const token = 'YOUR_AUTH_TOKEN_HERE';
      try {
        const response = await fetch('https://example.com/api/data', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const responseData = await response.json();
        setData(responseData);
      } catch (error) {
        console.error('Error fetching data: ', error);
      }
    };
  
    return (
      <div>
        <button onClick={handleButtonClick}>Fetch Data</button>
        {data && (
          <div>
            <h2>Response Data:</h2>
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </div>
        )}
      </div>
    );
  }
  

export default ExampleComponent;




