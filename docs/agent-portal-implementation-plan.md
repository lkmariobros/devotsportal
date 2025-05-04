# Agent Portal Implementation Plan

## Commission Calculation System

### Agent Ranks and Commission Percentages
There are 5 agent ranks, each with a different commission percentage:
- **Advisor**: 70%
- **Sales Leader**: 80%
- **Team Leader**: 83%
- **Group Leader**: 85%
- **Supreme Leader**: 85%

### Basic Commission Calculation
1. **Total Commission** = Transaction Value × Commission Rate / 100
2. **Agent Share** = Total Commission × Agent Commission Percentage / 100
3. **Agency Share** = Total Commission - Agent Share

### Co-Broking Arrangements
When co-broking is enabled:
1. The total commission is split between our agency and the co-broker agency
2. The split percentage is configurable (default is 50/50)
3. Our agency's portion is then split between the agent and the agency based on the agent's tier

### Commission Calculation Function
The `calculateCommission` function in `src/utils/commission.ts` handles all these calculations and returns a detailed breakdown.

### Transaction Form Data
The transaction form needs to collect:
- Transaction Value
- Commission Rate
- Agent Tier
- Co-Broking details (enabled/disabled and split percentage)

## Step-by-Step Implementation Plan

### Phase 1: Agent Dashboard Enhancement

#### Step 1: Improve the Agent Dashboard Layout
- Enhance the current dashboard with stats section at the top
- Add transaction data and commission visualizations
- Ensure responsive grid layout similar to admin dashboard

#### Step 2: Add Transaction Button
- Add a prominent "New Transaction" button on the top right
- Style it consistently with the application design
- Link it to the transaction form

### Phase 2: Transaction Form Development

#### Step 1: Create the Multi-Step Form Structure
- Set up the form container and navigation
- Implement step progress indicator
- Create the form state management

#### Step 2: Implement Individual Form Steps
1. **Transaction Type & Date**
   - Transaction type selection (Sale, Purchase, Rental)
   - Transaction date picker
   - Basic transaction details

2. **Property Selection**
   - Property address and details
   - Property type selection
   - Property value input

3. **Client Information**
   - Buyer/seller details
   - Contact information
   - Client type (individual/company)

4. **Co-Broking Setup**
   - Enable/disable co-broking
   - Co-broker agency details
   - Commission split percentage

5. **Commission Calculation**
   - Transaction value input
   - Commission rate input
   - Agent tier selection
   - Automatic calculation of commission breakdown
   - Display of agent share and agency share

6. **Document Upload**
   - Upload transaction documents
   - Document type categorization
   - File size and type validation

7. **Review & Submit**
   - Summary of all entered information
   - Final validation
   - Submit button

#### Step 3: Form Validation and State Management
- Implement validation for each step
- Set up form state persistence
- Add ability to save drafts and resume later

### Phase 3: Backend Integration

#### Step 1: Create Supabase Tables and Relationships
- Design database schema for transactions
- Set up relationships between agents, clients, and transactions
- Configure Row Level Security (RLS) policies

#### Step 2: Connect Form to Supabase
- Implement form submission to Supabase
- Set up real-time updates for transaction status
- Handle file uploads for documents

#### Step 3: Link to Admin Dashboard
- Ensure transactions appear in admin dashboard
- Implement admin approval workflow if needed
- Add filtering and sorting capabilities

### Phase 4: Testing and Refinement

#### Step 1: Test User Flows
- Test the complete transaction submission process
- Verify data appears correctly in both agent and admin dashboards
- Test edge cases and error handling

#### Step 2: Optimize Performance
- Implement lazy loading for form steps
- Optimize file uploads
- Add caching where appropriate

## Database Schema Design

### Tables Required
1. **property_transactions**
   - id (UUID, primary key)
   - agent_id (foreign key to profiles)
   - transaction_type (enum: sale, purchase, rental)
   - transaction_date (date)
   - status (enum: draft, pending, approved, rejected)
   - transaction_value (decimal)
   - commission_rate (decimal)
   - commission_amount (decimal)
   - agent_tier (text)
   - co_broking_enabled (boolean)
   - co_agent_id (foreign key to profiles, nullable)
   - commission_split (integer, percentage)
   - created_at (timestamp)
   - updated_at (timestamp)

2. **transaction_properties**
   - id (UUID, primary key)
   - transaction_id (foreign key to property_transactions)
   - address (text)
   - city (text)
   - state (text)
   - zip_code (text)
   - property_type (text)
   - bedrooms (integer, nullable)
   - bathrooms (decimal, nullable)
   - square_feet (integer, nullable)
   - created_at (timestamp)
   - updated_at (timestamp)

3. **transaction_clients**
   - id (UUID, primary key)
   - transaction_id (foreign key to property_transactions)
   - client_type (enum: buyer, seller, landlord, tenant)
   - name (text)
   - email (text)
   - phone (text)
   - is_company (boolean)
   - company_name (text, nullable)
   - created_at (timestamp)
   - updated_at (timestamp)

4. **transaction_documents**
   - id (UUID, primary key)
   - transaction_id (foreign key to property_transactions)
   - document_type (text)
   - file_path (text)
   - file_name (text)
   - file_size (integer)
   - uploaded_by (foreign key to profiles)
   - created_at (timestamp)

5. **commissions**
   - id (UUID, primary key)
   - transaction_id (foreign key to property_transactions)
   - agent_id (foreign key to profiles)
   - amount (decimal)
   - status (enum: pending, paid, cancelled)
   - payment_date (date, nullable)
   - created_at (timestamp)
   - updated_at (timestamp)

## Integration Points

### Agent Dashboard to Transaction Form
- "New Transaction" button links to the transaction form
- Transaction list shows status and links to transaction details

### Transaction Form to Admin Dashboard
- Submitted transactions appear in admin dashboard for approval
- Admin can view transaction details and approve/reject

### Real-time Updates
- Agents receive notifications when transaction status changes
- Commission calculations update in real-time as transaction details change

## Next Steps

1. Begin implementation of Agent Dashboard enhancements
2. Create the multi-step form structure
3. Implement individual form steps with validation
4. Connect to Supabase backend
5. Test and refine the user experience
