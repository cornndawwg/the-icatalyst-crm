export interface EmailTemplate {
  id: string
  name: string
  subject: string
  content: string
  category: 'interior-designer' | 'builder' | 'architect' | 'general'
  description: string
  variables: string[]
  previewText?: string
  tags: string[]
}

export interface EmailVariable {
  key: string
  label: string
  description: string
  defaultValue?: string
  category: 'partner' | 'integrator' | 'stats'
}

// Available variables for email templates
export const emailVariables: EmailVariable[] = [
  // Partner variables
  { key: 'firstName', label: 'First Name', description: 'Partner\'s first name', category: 'partner' },
  { key: 'lastName', label: 'Last Name', description: 'Partner\'s last name', category: 'partner' },
  { key: 'companyName', label: 'Company Name', description: 'Partner\'s company name', category: 'partner' },
  { key: 'partnerType', label: 'Partner Type', description: 'Type of partner (Interior Designer, Builder, etc.)', category: 'partner' },
  { key: 'location', label: 'Location', description: 'Partner\'s city/state', category: 'partner' },
  { key: 'specialties', label: 'Specialties', description: 'Partner\'s areas of expertise', category: 'partner' },
  
  // Integrator variables
  { key: 'integrator.firstName', label: 'Your First Name', description: 'Your first name', category: 'integrator' },
  { key: 'integrator.lastName', label: 'Your Last Name', description: 'Your last name', category: 'integrator' },
  { key: 'integrator.companyName', label: 'Your Company', description: 'Your company name', category: 'integrator' },
  { key: 'integrator.phone', label: 'Your Phone', description: 'Your phone number', category: 'integrator' },
  { key: 'integrator.email', label: 'Your Email', description: 'Your email address', category: 'integrator' },
  { key: 'integrator.website', label: 'Your Website', description: 'Your website URL', category: 'integrator' },
  
  // Stats variables
  { key: 'stats.avgProjectValue', label: 'Avg Project Value', description: 'Average smart home project value', defaultValue: '$15,000', category: 'stats' },
  { key: 'stats.partnersCount', label: 'Partner Count', description: 'Number of active partners', category: 'stats' },
  { key: 'stats.projectsCompleted', label: 'Projects Completed', description: 'Total projects completed', category: 'stats' },
]

// Pre-built email templates
export const emailTemplates: EmailTemplate[] = [
  // Interior Designer Templates
  {
    id: 'id-intro',
    name: 'Smart Home Partnership Introduction',
    subject: 'Partnership Opportunity: Enhance Your Designs with Smart Home Technology',
    category: 'interior-designer',
    description: 'Initial outreach to interior designers about partnership opportunities',
    variables: ['firstName', 'companyName', 'integrator.firstName', 'integrator.companyName', 'stats.avgProjectValue'],
    tags: ['introduction', 'partnership', 'outreach'],
    previewText: 'Elevate your interior design projects with cutting-edge smart home solutions',
    content: `Hi {{firstName}},

I noticed {{companyName}}'s impressive portfolio of luxury residential projects, and I wanted to reach out about a partnership opportunity that could benefit both our businesses.

I'm {{integrator.firstName}} from {{integrator.companyName}}, and we specialize in seamlessly integrating smart home technology into high-end residential spaces. We work exclusively with interior designers to ensure technology enhances rather than detracts from beautiful design.

Here's how partnering with us benefits your clients:

• **Invisible Technology**: We hide all tech components within your design vision
• **Enhanced Ambiance**: Automated lighting, shading, and climate control that complements your aesthetic
• **Added Value**: Smart home features can increase project values by {{stats.avgProjectValue}} on average
• **White-Glove Service**: We handle all technical aspects while you focus on design

I'd love to show you some examples of how we've enhanced other designers' projects without compromising their vision. 

Would you be interested in a brief 15-minute call to explore how we could collaborate on your upcoming projects?

Best regards,
{{integrator.firstName}}
{{integrator.companyName}}
{{integrator.phone}}
{{integrator.email}}`
  },
  {
    id: 'id-luxury',
    name: 'Luxury Client Collaboration',
    subject: 'Exclusive Partnership: Smart Home Solutions for Your Luxury Clients',
    category: 'interior-designer',
    description: 'Target designers working with high-end luxury clients',
    variables: ['firstName', 'companyName', 'integrator.companyName', 'specialties'],
    tags: ['luxury', 'high-end', 'exclusive'],
    content: `Dear {{firstName}},

Your work with {{specialties}} at {{companyName}} aligns perfectly with our mission to bring sophisticated smart home solutions to discerning clients.

{{integrator.companyName}} specializes in creating bespoke smart home experiences for luxury residences. We understand that your clients expect nothing but excellence, and technology should enhance their lifestyle seamlessly.

Our white-label partnership program offers:

• **Exclusive Pricing**: Special rates for your clients
• **Design Integration**: Technology that complements your aesthetic vision
• **Concierge Support**: Dedicated project management for your team
• **Revenue Sharing**: Earn commissions on all referred projects

Let's discuss how we can elevate your next luxury project together.

Warmly,
{{integrator.firstName}}
{{integrator.companyName}}`
  },
  
  // Builder Templates
  {
    id: 'builder-intro',
    name: 'Integrated Smart Home Solutions',
    subject: 'Smart Home Pre-Wire Partnership for {{companyName}}',
    category: 'builder',
    description: 'Initial outreach to custom home builders',
    variables: ['firstName', 'companyName', 'integrator.companyName', 'stats.avgProjectValue'],
    tags: ['introduction', 'pre-wire', 'builder'],
    content: `Hi {{firstName}},

As a leading custom home builder, {{companyName}} understands that today's homeowners expect smart technology to be seamlessly integrated from day one.

{{integrator.companyName}} partners with builders like you to provide comprehensive smart home pre-wire and integration services that:

• **Increase Home Values**: Smart homes sell for {{stats.avgProjectValue}} more on average
• **Reduce Callbacks**: Professional installation prevents post-construction issues
• **Differentiate Your Builds**: Stand out in a competitive market
• **Simplify the Process**: We handle all technology planning and implementation

We've helped builders across the region deliver homes that are truly ready for modern living. 

Can we schedule a brief meeting to discuss your upcoming projects?

Best regards,
{{integrator.firstName}}
{{integrator.companyName}}`
  },
  {
    id: 'builder-prewire',
    name: 'Pre-Wire Partnership Program',
    subject: 'Exclusive Builder Program: Smart Home Pre-Wire Services',
    category: 'builder',
    description: 'Detailed pre-wire partnership program for builders',
    variables: ['firstName', 'companyName', 'integrator.companyName'],
    tags: ['pre-wire', 'program', 'partnership'],
    content: `Dear {{firstName}},

I'm reaching out to introduce {{integrator.companyName}}'s Builder Partnership Program, designed specifically for custom home builders like {{companyName}}.

Our comprehensive pre-wire service includes:

**Phase 1 - Design & Planning**
• Smart home infrastructure design
• Low-voltage wiring plans
• Integration with architectural drawings

**Phase 2 - Rough-In**
• Structured wiring installation
• Future-proof infrastructure
• Builder-friendly scheduling

**Phase 3 - Finish & Commission**
• Device installation and programming
• Homeowner training
• Ongoing support

We work seamlessly with your construction schedule and provide your buyers with a turnkey smart home solution.

Would you like to learn more about adding this valuable service to your builds?

Sincerely,
{{integrator.firstName}}
{{integrator.companyName}}`
  },
  
  // Architect Templates
  {
    id: 'architect-intro',
    name: 'Architectural Smart Home Integration',
    subject: 'Technology Integration Partnership for Architectural Firms',
    category: 'architect',
    description: 'Initial outreach to architects about smart home planning',
    variables: ['firstName', 'companyName', 'integrator.companyName'],
    tags: ['introduction', 'architect', 'planning'],
    content: `Dear {{firstName}},

As technology becomes integral to modern architecture, {{integrator.companyName}} partners with forward-thinking firms like {{companyName}} to seamlessly integrate smart home systems into architectural designs.

We provide:

• **Early-Stage Consultation**: Technology planning during design phase
• **Specification Support**: Detailed smart home specifications for your drawings
• **Aesthetic Integration**: Solutions that enhance rather than compromise design
• **LEED & Efficiency**: Smart systems that support sustainable design goals

Our expertise ensures technology infrastructure is properly planned from conception, avoiding costly retrofits and maintaining design integrity.

I'd welcome the opportunity to discuss how we can support your upcoming projects.

Best regards,
{{integrator.firstName}}
{{integrator.companyName}}`
  },
  {
    id: 'architect-spec',
    name: 'Design-Build Technology Partnership',
    subject: 'Specification Support: Smart Home Systems for Your Projects',
    category: 'architect',
    description: 'Offering specification and design support services',
    variables: ['firstName', 'companyName', 'integrator.companyName', 'specialties'],
    tags: ['specification', 'design-build', 'support'],
    content: `Hi {{firstName}},

Your firm's focus on {{specialties}} aligns perfectly with our mission to integrate thoughtful technology solutions into architectural designs.

{{integrator.companyName}} offers complimentary specification support for your projects:

• **Technical Drawings**: Low-voltage and infrastructure plans
• **Product Specifications**: Detailed equipment and system specs
• **Budget Estimates**: Accurate technology budget planning
• **Vendor Coordination**: Single point of contact for all systems

We become your technology design partner, ensuring all systems are properly specified and coordinated with your architectural vision.

Could we schedule a brief consultation to review your current projects?

Regards,
{{integrator.firstName}}
{{integrator.companyName}}`
  },
  
  // General Follow-up Templates
  {
    id: 'general-followup',
    name: 'Partnership Follow-Up',
    subject: 'Following Up: Smart Home Partnership Opportunity',
    category: 'general',
    description: 'General follow-up template for any partner type',
    variables: ['firstName', 'companyName', 'integrator.firstName', 'integrator.companyName'],
    tags: ['follow-up', 'general'],
    content: `Hi {{firstName}},

I wanted to follow up on my previous email about partnering with {{companyName}} on smart home integration projects.

I understand you're busy, so I'll keep this brief. We've recently completed several projects that might interest you, and I'd love to share how we've helped other professionals in your industry.

Would you have 15 minutes this week or next for a quick call? I'm happy to work around your schedule.

Looking forward to connecting,
{{integrator.firstName}}
{{integrator.companyName}}`
  },
  {
    id: 'general-checkin',
    name: 'Quarterly Check-In',
    subject: 'Quick Check-In from {{integrator.companyName}}',
    category: 'general',
    description: 'Periodic check-in with existing partners',
    variables: ['firstName', 'integrator.firstName', 'integrator.companyName', 'stats.projectsCompleted'],
    tags: ['check-in', 'nurture', 'existing'],
    content: `Hi {{firstName}},

I hope this finds you well! I wanted to check in and see how things are going with your recent projects.

We've completed {{stats.projectsCompleted}} projects this quarter and have learned some new techniques that might benefit your upcoming work. 

Is there anything we can help with or any projects where smart home integration might add value?

Always here to help,
{{integrator.firstName}}
{{integrator.companyName}}`
  }
]

// Helper function to process template with variables
export function processTemplate(template: string, variables: Record<string, string>): string {
  let processed = template
  
  // Replace all variables in the template
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g')
    processed = processed.replace(regex, value || `[${key}]`)
  })
  
  // Replace any remaining variables with placeholders
  processed = processed.replace(/{{(\w+\.?\w*)}}/g, '[$1]')
  
  return processed
}

// Helper function to extract variables from template
export function extractVariables(template: string): string[] {
  const matches = template.match(/{{(\w+\.?\w*)}}/g) || []
  return [...new Set(matches.map(match => match.replace(/{{|}}/g, '')))]
}

// Get templates by category
export function getTemplatesByCategory(category: EmailTemplate['category']): EmailTemplate[] {
  return emailTemplates.filter(template => template.category === category)
}

// Get template by ID
export function getTemplateById(id: string): EmailTemplate | undefined {
  return emailTemplates.find(template => template.id === id)
}