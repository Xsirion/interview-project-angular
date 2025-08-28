const { HubConnectionBuilder, LogLevel } = require('@microsoft/signalr');

class StocksSignalRClient {
    constructor(url) {
        this.url = url;
        this.connection = null;
    }

    async connect() {
        try {
            console.log('Connecting to SignalR hub...');
            
            this.connection = new HubConnectionBuilder()
                .withUrl(this.url)
                .configureLogging(LogLevel.Debug)
                .build();

            // Set up event handlers
            this.setupEventHandlers();

            // Start the connection
            await this.connection.start();
            console.log('✅ Successfully connected to SignalR hub!');
            
            return true;
        } catch (error) {
            console.error('❌ Failed to connect to SignalR hub:', error.message);
            return false;
        }
    }

    setupEventHandlers() {
        // Handle connection close
        this.connection.onclose(async (error) => {
            console.log('🔌 Connection closed:', error ? error.message : 'No error');
            
            // Attempt to reconnect after 5 seconds
            setTimeout(async () => {
                console.log('🔄 Attempting to reconnect...');
                await this.connect();
            }, 5000);
        });

        // Subscribe to stock price updates
        this.connection.on('updateStockPrice', (stockUpdate) => {
            console.log('📈 Stock Price Update:', JSON.stringify(stockUpdate, null, 2));
        });

        // Handle any errors
        this.connection.on('error', (error) => {
            console.error('❌ SignalR Error:', error);
        });
    }

    async getAllStocks() {
        try {
            console.log('📋 Fetching all stocks...');
            const stocks = await this.connection.invoke('getAllStocks');
            console.log('📊 All Stocks:', JSON.stringify(stocks, null, 2));
            return stocks;
        } catch (error) {
            console.error('❌ Failed to fetch stocks:', error.message);
            throw error;
        }
    }

    async disconnect() {
        if (this.connection) {
            await this.connection.stop();
            console.log('🔌 Disconnected from SignalR hub');
        }
    }
}

// Main application
async function main() {
    const signalRUrl = 'http://localhost:32770/stocks';
    const client = new StocksSignalRClient(signalRUrl);

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
        console.log('\n🛑 Shutting down...');
        await client.disconnect();
        process.exit(0);
    });

    // Connect to SignalR
    const connected = await client.connect();
    if (!connected) {
        console.error('Failed to connect. Exiting...');
        process.exit(1);
    }

    // Fetch all stocks
    try {
        await client.getAllStocks();
    } catch (error) {
        console.error('Failed to fetch stocks:', error.message);
    }

    console.log('🎧 Listening for stock price updates...');
    console.log('Press Ctrl+C to exit');
}

// Start the application
main().catch(error => {
    console.error('Application error:', error);
    process.exit(1);
}); 