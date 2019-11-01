class BLEScanner {
    constructor() {
      this.device = null;
      this.led = null;
      this.writeChar = null;
      this.readChar = null;
      this.cpuVendor = null;
      this.cpuSpeed = null;
      this.onDisconnected = this.onDisconnected.bind(this);
    }
  
    /* the LED characteristic providing on/off capabilities */
    async setLedCharacteristic() {
      const service = await this.device.gatt.getPrimaryService(0xfff0);
      const characteristic = await service.getCharacteristic(
        "d7e84cb2-ff37-4afc-9ed8-5577aeb8454c"
      );
      // characteristic.startNotifications();
      this.led = characteristic;
  
      await this.led.startNotifications();
  
      this.led.addEventListener(
        "characteristicvaluechanged",
        handleLedStatusChanged
      );
    }

    async setReadCharacteristic() {
        const service = await this.device.gatt.getPrimaryService(0xfff0);
        const characteristic = await service.getCharacteristic(0xfff1);
        // characteristic.startNotifications();
        this.readChar = characteristic;
    
        await this.readChar.startNotifications();
        console.log("read char");
        console.log(this.readChar);
        this.readChar.addEventListener(
          "characteristicvaluechanged",
          handleLedStatusChanged
        );
      }

      async setWriteCharacteristic() {
        const service = await this.device.gatt.getPrimaryService(0xfff0);
        // console.log(service)
        const characteristic = await service.getCharacteristic(0xfff2);
        // console.log(characteristic)
        // characteristic.startNotifications();
        this.writeChar = characteristic;
    
        // await this.writeChar.startNotifications();
        console.log("write char");
        console.log(this.writeChar);
        this.writeChar.addEventListener(
          "characteristicvaluechanged",
          handleLedStatusChanged
        );
      }

  
    // /* the Device characteristic providing CPU information */
    // async setDeviceCharacteristic() {
    //   const service = await this.device.gatt.getPrimaryService(0xfff1);
    //   const vendor = await service.getCharacteristic(
    //     "d7e84cb2-ff37-4afc-9ed8-5577aeb84542"
    //   );
    //   this.cpuVendor = vendor;
  
    //   const speed = await service.getCharacteristic(
    //     "d7e84cb2-ff37-4afc-9ed8-5577aeb84541"
    //   );
    //   this.cpuSpeed = speed;
    // }
  
    /* request connection to a BalenaBLE device */
    async request() {
        let options = {
            acceptAllDevices: true,
            optionalServices: [0xfff0
              // , 0xfff1
            ]
          };
    //   let options = {
    //     filters: [
    //       {
    //         name: "balenaBLE"
    //       }
    //     ],
    //     optionalServices: [0xfff0, 0xfff1]
    //   };
      if (navigator.bluetooth == undefined) {
        alert("Sorry, Your device does not support Web BLE!");
        return;
      };
      this.device = await navigator.bluetooth.requestDevice(options);
    //   this.device = await navigator.bluetooth.requestDevice(
    //     { filters: [{
    //                 services: [0x1234, 0x12345678, '99999999-0000-1000-8000-00805f9b34fb']
    //         }]
    //     }
    //   )
      if (!this.device) {
        throw "No device selected";
      }
      console.log('Name: ' + this.device.name);
      this.device.addEventListener("gattserverdisconnected", this.onDisconnected);
    }
  
    /* connect to device */
    async connect() {
      if (!this.device) {
        return Promise.reject("Device is not connected.");
      }
      await this.device.gatt.connect();
    }
  
    /* read LED state */
    async readLed() {
      await this.led.readValue();
    }
  
    /* read CPU manufacturer */
    async readCPUVendor() {
      let vendor = await this.cpuVendor.readValue();
      return decode(vendor);
    }
  
    /* read CPU speed */
    async readCPUSpeed() {
      let speed = await this.cpuSpeed.readValue();
      return decode(speed);
    }
  
    /* change LED state */
    async writeLed(data) {
      await this.led.writeValue(Uint8Array.of(data));
      await this.readLed();
    }

        /* change LED state */
    async writeELM(data) {
        console.log("data " + data);
        await this.writeChar.writeValue(Uint8Array.of(data));
        console.log("wrote data");
        // let result = await this.readELM();
        // console.log(result);
        // return decode(result);
    }

    /* read LED state */
    async readELM() {
        await this.readChar.readValue();
    }



  
    /* disconnect from peripheral */
    disconnect() {
      if (!this.device) {
        return Promise.reject("Device is not connected.");
      }
      return this.device.gatt.disconnect();
    }
  
    /* handler to run when device successfully disconnects */
    onDisconnected() {
      alert("Device is disconnected.");
      location.reload();
    }
  }
  