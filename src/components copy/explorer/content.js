/**
 * Content layer for Gene & Stem.
 * Source of truth for every word on the page and for the 3D focus graph.
 *
 * Block grammar used inside `content` and `INSPECT[].content`:
 *   '# Heading'  -> section heading
 *   '- item'     -> bullet
 *   '~ item'     -> numbered item
 *   '= Value | Label | Note'   -> metric tile
 *   '! Kind | Text'            -> callout (Kind: ethics | risk | note)
 *   '> Quote'  '> — Attribution' -> pull quote
 *   anything else              -> paragraph
 */
export const SECTIONS = [
  {
    nav: "Home",
    eyebrow: "Science, Technology and Society",
    title: "Gene Therapy & Stem Cell Research",
    readerTitle: "Gene Therapy and Stem Cell Research: Ethical and Social Issues",
    lede:
      "Innovation has the power to heal. Scroll to fall from orbit to one person, step inside the body, and fly down to the genome, then on to cells, delivery vectors and editing complexes.",
    primary: "About the study",
    secondary: null,
    focus: "dna",
    content: [
      "#The project",
      "A project presented to the Faculty of the College of Arts and Sciences, PHINMA St. Jude College, Sampaloc Manila, in partial fulfillment of the requirements in Science, Technology and Society. Section BSIT2-02, October 2026.",
      "#Researchers",
      "- Borlagda, Jaeca V.",
      "- Crumb, Lawrence",
      "- Escomen, Arped Jey",
      "- Gomez, Jelomar",
      "- Guevarra, Ralph Gian",
      "- Lomocso, Charles",
      "- Lutrania, Leimark",
      "- Sengco, Rome",
      "- Villanueva, Christian",
      "#How to use this explorer",
      "This instrument has two halves that never separate. Every chapter carries the paper’s argument; every structure in the molecular world is clickable, and each one explains what it is, what it does clinically, and where it becomes ethically contested.",
      "= 130vh | Scroll per chapter | Each chapter gives the camera room to ease in, hold, and release",
      "= 15 | Inspectable structures | Hover to preview, click for the full record",
      "! note | Navigate by scrolling, dragging to rotate, clicking any glowing structure, or jumping with the chapter list and the dot rail on the right."
    ]
  },
  {
    nav: "The Person",
    eyebrow: "Prologue · One person",
    title: "Start with one person",
    readerTitle: "One person, one genome",
    lede:
      "Every therapy in this paper begins with a single body: tens of trillions of cells, nearly all carrying the same genome.",
    primary: "Read the prologue",
    secondary: null,
    focus: null,
    content: [
      "#One person, one genome",
      "Every therapy in this paper begins with a single body. An adult is built from tens of trillions of cells, and nearly every one of them carries a copy of the same genome.",
      "= ~37 trillion | Cells in an adult body | A widely cited estimate; published figures vary",
      "= ~3.1 billion | Base pairs in the human genome | Organised into 23 pairs of chromosomes",
      "#Why the paper starts here",
      "Gene therapy and stem cell research both act on this body: one by changing the instructions inside cells, the other by supplying cells that can replace what is lost. The ethical questions only make sense once you remember that a person, not a specimen, is on the receiving end.",
      "! note | Drag to turn the figure around. Keep scrolling to go inside. The figure is a stylised teaching model, not an anatomical reconstruction."
    ]
  },
  {
    nav: "Inside the Body",
    eyebrow: "Prologue · Inside the body",
    title: "Inside the body",
    readerTitle: "Cells, tissues and where the therapies fit",
    lede:
      "Hundreds of cell types, one shared instruction set. Stem cells and gene therapy each try to repair a different part of that system.",
    primary: "Read the prologue",
    secondary: null,
    focus: null,
    content: [
      "#Cells, tissues and the signals between them",
      "The body contains hundreds of distinct cell types, from neurons to red blood cells. They look and behave differently, yet almost all share one DNA sequence. What differs is which genes each cell reads.",
      "#Where stem cells fit",
      "Some tissues renew themselves throughout life because they hold stem cells. Blood is the clearest example: stem cells in bone marrow keep producing new blood cells. That ability is what stem cell therapies try to borrow.",
      "#Where gene therapy fits",
      "When a cell carries a faulty gene, replacing the cell is not always enough. Gene therapy aims to correct or compensate for the fault itself."
    ]
  },
  {
    nav: "The Genome",
    eyebrow: "Prologue · The genome",
    title: "Down to the genome",
    readerTitle: "The double helix and the single-letter error",
    lede:
      "Inside each nucleus, a molecule two nanometres wide holds the instructions. One changed letter can cause disease.",
    primary: "Read the prologue",
    secondary: { label: "Inspect the helix", key: "dna" },
    focus: "dna",
    content: [
      "#The double helix",
      "DNA is a two-stranded molecule about two nanometres wide, with four bases (A, T, G and C) paired across the strands. The order of those bases is the genetic instruction set.",
      "= ~2 m | DNA in one human cell's nucleus | Stretched end to end, folded into a space a few micrometres wide",
      "= ~20,000 | Protein-coding genes | A small fraction of the genome's total sequence",
      "#One letter can matter",
      "Some diseases trace to a single changed base. Sickle cell disease, for example, comes from one base change in the gene for part of haemoglobin. That is the kind of fault gene therapy and gene editing set out to address, and the reason the rest of this explorer looks at how.",
      "! note | From here the flight continues through cells, editing tools and delivery vectors. Click any glowing structure to inspect it."
    ]
  },
  {
    nav: "About the Study",
    eyebrow: "Chapter 1 · The problem and its background",
    title: "About the study",
    readerTitle: "About the study",
    lede:
      "Two of medicine’s biggest advances raise ethical and social questions. Who is responsible for answering them?",
    primary: "Read chapter 1",
    secondary: { label: "Inspect the hESC", key: "cell0" },
    focus: "cell0",
    content: [
      "#Background",
      "Stem cell research and gene therapy are two of the most important advances in medicine today. Instead of managing symptoms, both treat disease at the molecular or cellular level, and together they contribute to regenerative and transplantation medicine (Volarevic et al., 2018; Sade & Khushf, 1998).",
      "Their potential is growing faster than the ethical and legal frameworks meant to guide them. The study treats these issues as matters of governance, legitimation and accountability of science and technology, not as obstacles to progress.",
      "The gap is now measurable. As of June 2024, 32 gene therapies, 28 RNA therapies and 68 non-genetically modified cell therapies had been approved worldwide, with 4,002 more therapies in development — while regulatory approaches still diverge sharply across the United States, the European Union, Japan, Canada, Australia, Taiwan and South Korea (Frontiers in Pharmacology, January 2025).",
      "#Statement of the problem",
      "~ What are the potential risks of gene therapy and stem cell research to human health and the environment, especially unintended genetic changes?",
      "~ What are the advantages and disadvantages of these technologies for different populations, given high treatment cost and unequal access to health care?",
      "~ What processes can address ethical issues such as human embryo use, informed consent, genetic privacy and heritable modification?",
      "~ How do scientists, government bodies and industries help govern and advance their safe and ethical use?",
      "#Research objectives",
      "- Identify potential risks to human health and the environment, including unintended genetic changes.",
      "- Explore whether benefits and risks are shared equitably despite high cost and unequal access.",
      "- Define the consensus process for embryo use, informed consent, genetic privacy and heritable modification.",
      "- Understand the roles of researchers, government bodies and industries in regulating these technologies.",
      "#Significance of the study",
      "- Scientists and researchers: scientific responsibility goes beyond producing results, including long-term impacts, ethical codes and honest reporting of uncertainty.",
      "- Policy makers and regulators: a foundation for clear and fair guidelines, since law often lags behind new techniques.",
      "- Medical field and patients: safe, effective treatments that are reachable beyond those who can afford them, with informed consent.",
      "- Society: public discussion of how far these technologies should develop and who should control them.",
      "- Future researchers: a reference for genetic privacy, commercialization and global access to treatment.",
      "#Scope and delimitation",
      "The study reviews and analyzes existing scholarly sources only. It collects no new data and carries out no experiments, clinical trials or interviews. It is international in outlook and originally covered the period from the first gene therapy protocols in 1990 to the 2016 survey of U.S. stem cell clinics.",
      "This edition extends that horizon. Because the field moved faster than the original frame allowed, the review now follows the evidence through to the 2026 clinical and regulatory record: the first approved CRISPR therapy, its paediatric label expansion, the maturing induced-pluripotent-stem-cell trial landscape, in-vivo editing programmes, cell-and-gene-therapy access models, and the governance frameworks built after the 2018 germline scandal.",
      "It still does not give a comparative legal analysis or a detailed account of Philippine policy, and it excludes genetic enhancement of normal traits. Technical details are discussed only as needed to explain ethical and safety concerns.",
      "#Definition of terms",
      "- Stem Cell Therapy (SCT): using stem cells to repair or replace damaged cells, tissues or organs.",
      "- Mesenchymal Stem Cells (MSCs): adult stem cells that can give rise to bone, cartilage, muscle and fat cells.",
      "- hESC-RPE: retinal pigment epithelial cells produced from human embryonic stem cells.",
      "- Gene Therapy: changing someone’s DNA to treat or prevent disease.",
      "- Somatic Cell Gene Therapy: changes body cells and affects only the person treated.",
      "- Germ-Line Gene Therapy: modifies germ cells so changes pass to offspring and future generations.",
      "- Human Embryonic Stem Cells (hESCs): stem cells from the inner cell mass of a developing human embryo before implantation.",
      "- Induced Pluripotent Stem Cells (iPSCs): adult cells induced to function like embryonic stem cells.",
      "- Heritable Modification: a genetic change that can be passed on to future generations.",
      "- Ex vivo editing: cells are removed from the patient, edited in a laboratory, and returned.",
      "- In vivo editing: the editing agent is infused directly into the patient and works inside the body.",
      "- Base editing: a modified Cas9 that chemically converts one DNA letter into another without cutting both strands."
    ]
  },
  {
    nav: "Gene Therapy",
    eyebrow: "Changing the genetic material",
    title: "Gene therapy",
    readerTitle: "Gene therapy",
    lede:
      "Treating disease by altering DNA. A change in body cells affects one patient; a germ-line change affects descendants.",
    primary: "Read more",
    secondary: { label: "Inspect CRISPR-Cas9", key: "mol0" },
    focus: "mol0",
    content: [
      "Since the first protocols were approved in 1990, over 100 research protocols have been launched for cancer, HIV infection, cystic fibrosis, Gaucher disease, severe combined immune deficiency, familial hypercholesterolemia and rheumatoid arthritis. Treatments for muscular dystrophies and hemoglobin disorders have also been proposed (Sade & Khushf, 1998).",
      "#From protocol to licensed product",
      "The 1990s debate was about whether gene therapy would ever work. The modern debate is about who it reaches. Ex vivo editing now produces licensed cures: in December 2023 the FDA approved Casgevy (exagamglogene autotemcel, exa-cel, Vertex/CRISPR Therapeutics), the first CRISPR/Cas9 therapy, and Lyfgenia (lovotibeglogene autotemcel, lovo-cel, bluebird bio), a lentiviral therapy, for severe sickle cell disease in patients aged 12 and older.",
      "Both work by removing a patient’s blood stem cells, reprogramming them and reinfusing them after myeloablative busulfan conditioning. Casgevy edits the erythroid-specific enhancer of BCL11A to reactivate fetal hemoglobin; Lyfgenia inserts a modified beta-globin gene. A subsequent milestone lowered Casgevy’s eligible age from 12 to 2 years.",
      "= >90% | Patients free of severe vaso-occlusive events | Reported across both exa-cel and lovo-cel programmes, with near-complete resolution in paediatric participants",
      "= 2 | FDA-approved cures for sickle cell disease | Casgevy (CRISPR) and Lyfgenia (lentiviral), both December 2023",
      "#Ex vivo and in vivo",
      "Editing outside the body requires apheresis, conditioning chemotherapy and a hospital stay. Editing inside the body removes all three: a single infusion reaches the target organ directly. Intellia’s lonvoguran ziclumeran (NTLA-2002) edits KLKB1 in the liver to treat hereditary angioedema and reported two-year durability of a one-time 50 mg infusion; Verve’s VERVE-102, a base editor aimed at PCSK9, halved LDL cholesterol on average in the four participants at its highest dose in 2025. Beam’s BEAM-302 corrected the disease-causing mutation in alpha-1 antitrypsin deficiency in March 2025.",
      "In-vivo editing changes the governance question. There is no cell product to batch-test and no apheresis record to audit; the therapeutic agent is a single infusion that cannot be recalled once it has reached the liver.",
      "#Somatic and germ-line",
      "Modifying somatic cells affects just one patient, while germ-line modification would affect future generations. So far, only somatic cells have been used in research, and techniques for spreading altered genes through germ cells are not available, but they could become so.",
      "If unsuitable vectors and target cells are used, the wrong therapeutic gene may reach the gonads and change the offspring’s genetic makeup.",
      "#What critics say",
      "- The high cost goes against fairness and equality.",
      "- Altering the human genome is “playing God” and threatens human dignity.",
      "- Allowing somatic therapy is a slippery slope toward germ-line therapy.",
      "#What advocates say",
      "- Gene therapy could cure diseases other therapies cannot treat, such as Parkinson’s disease and retinoblastoma.",
      "- It could reduce life-long health care expenses.",
      "- Inaction would be unethical, especially when patients’ chances are so slim.",
      "! ethics | The 2025 comparative analysis of lovo-cel and exa-cel shows how logistics, not only biology, decides who is cured. Mobilisation with single-agent plerixafor was difficult in both trials and often needed repeated cycles; more exa-cel participants required three or more apheresis procedures because higher CD34+ targets were needed to offset CRISPR-associated stem cell loss."
    ]
  },
  {
    nav: "Stem Cell Research",
    eyebrow: "Regeneration and its limits",
    title: "Stem cell research",
    readerTitle: "Stem cell research",
    lede:
      "Stem cells may treat degenerative, autoimmune and genetic disorders, but embryo use and safety remain contested.",
    primary: "Read more",
    secondary: { label: "Inspect the iPSC", key: "cell1" },
    focus: "cell1",
    content: [
      "Stem cell therapy has shown promise in degenerative, autoimmune and genetic disorders. Mesenchymal stem cells have given promising results in autoimmune and chronic inflammatory diseases, and hESC-derived retinal pigment epithelial cells have been used to treat macular degeneration (Volarevic et al., 2018).",
      "#The embryo question",
      "The main ethical concern is the destruction of human embryos needed to isolate hESCs. This has led to divergent national policies, delayed hESC-based therapies, and a research focus mainly on animal models.",
      "#Concerns about iPSCs",
      "iPSC technology does not destroy embryos, but it raises new worries: reproductive cloning of humans, genetically modified embryos and human-animal chimeras.",
      "Undifferentiated iPSCs can form teratomas after transplantation, and genomic stability is an issue in clinical use.",
      "#Concerns about MSCs",
      "MSCs can inhibit anti-tumor immune responses and stimulate new blood vessel growth, which may lead to tumor growth and metastasis.",
      "#The trial landscape, 2024–2026",
      "The iPSC field has moved from theory to dose-response evidence. More than 115 trials are now running across Parkinson’s disease, macular degeneration, spinal cord injury, heart failure, diabetes, fertility and cancer. A 2025 review of human-pluripotent-stem-cell trials surveyed retinal pigment epithelium, insulin-secreting progenitors, dopamine-secreting progenitors, oligodendrocytes, GABAergic neurons, cardiomyocytes, mesenchymal stem cells and engineered natural killer cells — and weighed universal against autologous cells, and progenitors against mature cells, as therapeutic sources.",
      "Kyoto University Hospital reported the strongest efficacy signal: in a Phase I/II trial, 7 patients received bilateral iPSC-derived dopaminergic progenitors, and at 24 months 4 of 6 evaluable patients showed significant motor improvement with PET-confirmed dopamine production — a 63.5% rise in dopamine synthesis in the high-dose group against 7.0% in the low-dose group.",
      "#From eye to heart to fertility",
      "The National Eye Institute runs a Phase I/IIa trial transplanting a 2×4 mm autologous iPSC-derived retinal pigment epithelium patch on a biodegradable scaffold, with five-year safety and durability monitoring — durability, not restoration, is the endpoint. Heartseed and Novo Nordisk are advancing purified iPSC-derived ventricular cardiomyocytes in Phase I/II for heart failure. In January 2025, Gameto received FDA clearance for Fertilo, the first iPSC-based therapy in a U.S. Phase 3 trial: iPSC-derived ovarian support cells mature eggs externally, cutting hormone injections by roughly 80% and shortening IVF cycles from 10–14 days to 2–3 days.",
      "#Science and commerce",
      "In 2016, 351 businesses offered stem cell interventions at 570 clinics in the United States, often without enough evidence of safety or effectiveness (Turner & Knoepfler, 2016, cited in Volarevic et al., 2018). Direct-to-consumer clinics remain the clearest case where commercial interest outruns evidence.",
      "! risk | The three persistent clinical risks are unchanged by progress: tumorigenicity from undifferentiated cells, immune rejection of non-autologous grafts, and manufacturing complexity that limits how many patients a single validated process can serve."
    ]
  },
  {
    nav: "Clinical Milestones",
    eyebrow: "Chapter 2 · The field since the first protocols",
    title: "Clinical milestones, 2023–2026",
    readerTitle: "What actually arrived: the clinical record",
    lede:
      "The strongest evidence for this paper is no longer hypothetical. Five years of approvals, dose-response data and access experiments now test every ethical claim.",
    primary: "Open the record",
    secondary: { label: "Inspect base editor", key: "mol5" },
    focus: "mol5",
    content: [
      "#Why this chapter exists",
      "An ethical argument is only as good as its facts. The original review could describe promise and risk in the abstract because almost nothing had been licensed. That is no longer true, and the new facts change the argument in three ways: they show which risks were real, which were overstated, and which governance problems appear only after approval.",
      "#What the record settles",
      "- Unintended immune and inflammatory harm was a genuine risk, not a hypothetical one. Vector immunogenicity, insertional mutagenesis and residual bacterial endotoxin remain the reasons batch purity and vector design are regulated so heavily.",
      "- Cure is achievable. In both approved sickle cell therapies, more than 90% of participants were free of severe vaso-occlusive events, with near-complete resolution in paediatric participants.",
      "- Off-target editing is a manageable engineering problem rather than a fatal flaw. Base editors convert one DNA letter into another without a double-strand break, and BEAM-302 corrected the disease-causing mutation in alpha-1 antitrypsin deficiency in March 2025.",
      "= >90% | Resolution of severe vaso-occlusive events | Exa-cel and lovo-cel, with near-complete resolution in paediatric participants",
      "= 63.5% | Dopamine synthesis increase, high dose | iPSC-derived dopaminergic progenitors in Parkinson’s disease at 24 months, versus 7.0% at low dose",
      "= 50% | Average LDL cholesterol reduction | VERVE-102 base editing in the four highest-dose participants, 2025",
      "#What the record exposes",
      "Approval did not end the ethical problem; it moved the problem. Three issues are now sharper than they were in the original review.",
      "The first is manufacturing inequality. Higher CD34+ cell targets were needed for exa-cel to compensate for CRISPR-associated stem cell loss, so more exa-cel participants required three or more apheresis procedures. A cure that demands more of a patient’s body to manufacture is not equally available to every patient.",
      "The second is durability under real conditions. Some participants had vaso-occlusive events after treatment, including beyond the primary efficacy period, and long-term follow-up is now a permanent obligation rather than a trial endpoint. No recurrent strokes were reported among lovo-cel participants with a history of overt stroke.",
      "The third is the shift in vivo. There is no cell product to batch-test and no apheresis record to audit; the therapeutic agent is a single infusion that cannot be recalled once it has reached the liver.",
      "#The governance response",
      "Regulators answered with payment models rather than prohibitions. The CMS Cell and Gene Therapy Access Model ties Medicaid payment for sickle cell gene therapies to outcomes, with rebates if treatment does not work fully; it covers 33 states plus Washington, D.C., and Puerto Rico, together representing 84% of Medicaid beneficiaries with sickle cell disease.",
      "! note | Outcome-based payment is an ethical instrument, not only a financial one. It converts the question “does this work?” into a contractual condition, which is the first time the durability risk has been priced into access."
    ]
  },
  {
    nav: "Ethical Issues",
    eyebrow: "Where do we draw the line?",
    title: "Ethical issues",
    readerTitle: "Ethical issues",
    lede:
      "Human embryo use, informed consent, genetic privacy and heritable modification — and the process by which a consensus on them is reached.",
    primary: "Read more",
    secondary: { label: "Inspect germline scope", key: "mol4" },
    focus: "mol4",
    content: [
      "The study looks at four recurring ethical questions and the process by which a consensus on them can be reached.",
      "- Human embryo use: hESC research requires destroying embryos, which is why national policies diverge.",
      "- Informed consent: patients should understand the procedures and their risks before treatment.",
      "- Genetic privacy: protecting genetic information is an area where law often lags behind new techniques.",
      "- Heritable modification: germ-line changes would reach future generations who cannot consent.",
      "#Consent after approval",
      "Consent is no longer a single signature before a trial. Autologous therapy requires patients to understand apheresis, myeloablative conditioning, infertility risk, a long hospital stay and decades of follow-up. When a therapy is one-time and irreversible, the consent conversation carries the weight that repeated treatment decisions used to share.",
      "For in-vivo editing, the calculus shifts again. A single infusion that edits liver cells cannot be surgically undone; the patient consents to a permanent change with no cell bank held in reserve.",
      "#The germline red line",
      "In November 2018, He Jiankui announced at the Second International Summit on Human Genome Editing in Hong Kong that he had used CRISPR on human embryos, producing twins with intended HIV resistance. His claims were unverified. Organizers condemned the work as “deeply disturbing”, irresponsible and a violation of international scientific norms, and called for an investigation — citing inadequate medical indication, poor design, failure to meet ethical standards and a lack of transparency in development, review and conduct.",
      "The summit did not endorse a blanket moratorium. Organizers rejected “draconian bans” as potentially antithetical to scientific progress and instead moved toward a rigorous, responsible pathway for any future trials. The wider landscape stayed a patchwork: UNESCO’s International Bioethics Committee called for a moratorium in 2015, the Council of Europe’s Oviedo Convention prohibits heritable genome modification, and a 2014 survey of 39 countries found 25 with legal bans, four with guideline bans, and a U.S. de facto ban through appropriations provisions and NIH funding restrictions.",
      "> Editing the human germline is not a technical problem awaiting a better enzyme. It is a consent problem: the people affected cannot be asked.",
      "#Governance after 2018",
      "The governance response was institutional rather than legal. The World Health Organization convened a multidisciplinary expert advisory committee in December 2018 and published Human genome editing: a framework for governance in July 2021, accompanied by separate recommendations and a position paper. The framework spans somatic, germline and heritable editing, sets out institutional, national, regional and global oversight mechanisms, identifies the values that justify governance, and works through seven scenarios showing how the components combine in practice.",
      "The U.S. and U.K. national academies launched a parallel international commission on heritable human genome editing. Ethics councils from France, Germany and the U.K. jointly argued that clinical use would require a level of public ethical reflection not yet met, and a survey of 106 nations suggested emerging global consensus around prohibition of heritable human genome editing.",
      "#Objections raised by critics",
      "Gene therapy is said to go against fairness and equality, threaten human dignity by “playing God”, and open a slippery slope from somatic to germ-line therapy (Sade & Khushf, 1998).",
      "#Human dignity",
      "Issues of disability, human dignity and equal access affect the whole community, not only scientists and physicians.",
      "! ethics | The 2021 WHO framework is deliberately non-binding. It supplies the review criteria that national regulators can adopt, which is why international disagreement now looks like uneven adoption of one shared template rather than competing rulebooks."
    ]
  },
  {
    nav: "Benefits & Risks",
    eyebrow: "Weighing promise and harm",
    title: "Benefits and risks",
    readerTitle: "Benefits and risks",
    lede:
      "Cures and regeneration on one side; unintended changes, unequal access and weak regulation on the other.",
    primary: "Read more",
    secondary: { label: "Inspect AAV vector", key: "mol1" },
    focus: "mol1",
    content: [
      "#Potential benefits",
      "- Cures for diseases other therapies have not been able to treat.",
      "- Possibly lower life-long health care costs.",
      "- Regenerative and transplantation medicine through stem cells.",
      "- Dose-response evidence in Parkinson’s disease, where a higher dose of iPSC-derived dopaminergic progenitors raised dopamine synthesis 63.5% against 7.0% at low dose.",
      "- Access models that tie payment to outcomes, so payers absorb the cost of a treatment that fails.",
      "#Potential risks",
      "- Unintended genetic changes affecting human health and the environment.",
      "- Teratomas from undifferentiated iPSCs, and tumor growth linked to MSCs.",
      "- Germ-line changes passed to offspring.",
      "- Unproven stem cell treatments sold directly to consumers.",
      "- Off-target edits, immune responses to vectors, and insertional mutagenesis from integrating vectors.",
      "- Residual bacterial endotoxin in batches, which can provoke severe inflammation or sepsis.",
      "#Equity and responsibility",
      "High treatment cost and unequal access raise the question of whether benefits and risks are shared fairly across people and communities. The numbers make the gap concrete: sickle cell disease causes an estimated 300,000–400,000 births a year, over 80% of them in sub-Saharan Africa, while U.S. list prices sit near $2.2 million for Casgevy and $3.1 million for Lyfgenia per patient.",
      "= 300k–400k | Annual sickle cell births | Over 80% in sub-Saharan Africa, where access to these therapies is most limited",
      "= $2.2M / $3.1M | U.S. list price per patient | Casgevy and Lyfgenia respectively",
      "= €80,000 | Dutch cost-effectiveness threshold per QALY | Against an estimated €123,384 per QALY, so the therapy was judged not cost-effective at list price",
      "#The reimbursement verdict",
      "ICER estimated that lovo-cel and exa-cel could meet common cost-effectiveness thresholds if priced between $1.35 million and $2.05 million, and recommended pricing toward the lower end to improve access. A Dutch societal lifetime analysis found gene therapy versus comprehensive care yielded 11.70 additional life-years and 13.29 additional quality-adjusted life-years, but at €123,384 per QALY deterministic and €124,972 probabilistic, with a five-year budget impact near €71 million. Price reduction was judged essential for economic viability.",
      "Scientists, policy makers, regulators, industries and the public share responsibility for making these technologies safe and acceptable.",
      "! risk | The efficiency of a one-time cure and the affordability of a one-time cure pull in opposite directions. A single treatment removes lifelong care costs from the system while concentrating the entire price into a single budget year, which is why outcome-based payment and rebate models appeared."
    ]
  },
  {
    nav: "Access & Governance",
    eyebrow: "Chapter 4 · Who is accountable",
    title: "Access, equity and governance",
    readerTitle: "Access, equity and governance",
    lede:
      "A cure that exists and a cure that arrives are different claims. This chapter is about the machinery in between.",
    primary: "Open the analysis",
    secondary: { label: "Inspect CAR-T cell", key: "cell4" },
    focus: "cell4",
    content: [
      "#The access gap",
      "Sickle cell disease is poverty-linked: lifelong care costs can impoverish families while global spending on care and research stays low, and most advances originate in high-income countries. A Gambia-focused review concludes that gene therapy in low- and middle-income settings is constrained by high cost, limited accessibility and safety concerns such as off-target effects and immune responses, and calls for sustainable financing models, global funding frameworks, public–private partnerships, stronger health infrastructure, research collaboration, community involvement and evolving ethical and regulatory frameworks.",
      "Democratising the platform matters as much as lowering the price. Non-viral lipid nanoparticles avoid viral capsids, are scalable to manufacture, and hold out the prospect of lower long-term production costs — the accessibility argument is partly a chemistry argument.",
      "#Regulatory convergence across Asia-Pacific",
      "Asia-Pacific regulators are converging on centralised oversight of these products rather than on prohibition. India brought cell- and stem-cell-derived products, gene therapeutic products and xenografts into its Centrally Licence Approving Authority framework through amendments to the Drugs Rules, 1945, so central and state regulators now supervise CAR-T therapies, gene editing and gene replacement treatments, and animal-tissue products such as heart valves under one standard. Japan operates conditional-approval pathways for cell, tissue and gene therapy products. Singapore uses risk-based classification of the same product family. South Korea regulates them as advanced biological products.",
      "The ISCT Asia-Pacific Industry Committee publishes a practical regulatory roadmap comparing these approval pathways in Cytotherapy. Across the region, the recurring unresolved question is regulated access to unapproved and unproven therapies — how to let desperately ill patients reach something experimental without legitimising clinics that sell unproven cell injections.",
      "#The global framework",
      "The WHO Human genome editing: a framework for governance (July 2021) is the closest thing to a shared reference. It advises on institutional, national, regional and global mechanisms, draws on good practice in governing emerging technologies, sets out the values and principles that justify oversight, reviews available tools and processes, and presents seven scenarios showing how the components combine. It is technical advice, not binding law — which is precisely why adoption varies.",
      "Below the international level, the patchwork persists: some countries ban heritable editing outright, others rely on guidelines, and others restrict it through funding provisions rather than statute.",
      "#A practical accountability model",
      "Four instruments carry demonstrated weight, and each answers a different failure.",
      "- Outcome-based payment (the CMS Cell and Gene Therapy Access Model) answers the risk that a costly treatment fails; rebates follow non-response.",
      "- Conditional and centralised licensing answers the risk that unproven products reach patients; approval is contingent on continued evidence.",
      "- Registries and long-term follow-up answer the risk of delayed harm, including insertional mutagenesis and late events beyond the primary efficacy period.",
      "- Transparency mandates and community involvement answer the risk of governance being decided without the people affected.",
      "! note | Responsibility in this field is distributed. Manufacturers own quality and price, regulators own approval conditions, clinicians own consent, payers own access rules, and the public owns the limits of what should be developed at all. No single body can discharge the others’ share."
    ]
  },
  {
    nav: "References",
    eyebrow: "Sources",
    title: "References",
    readerTitle: "References",
    lede: "The sources this study is built on, including the evidence added in this edition.",
    primary: "Open references",
    secondary: { label: "Inspect nucleosome", key: "nucleosome" },
    focus: "nucleosome",
    content: [
      "#Original sources",
      "~ Sade, R. M., & Khushf, G. (1998). Gene therapy: Ethical and social issues. Journal of the South Carolina Medical Association, 94, 406–410.",
      "~ Volarevic, V., Markovic, B. S., Gazdic, M., Volarevic, A., Jovicic, N., Arsenijevic, N., Armstrong, L., Djonov, V., Lako, M., & Stojkovic, M. (2017). Ethical and safety issues of stem cell-based therapy. International Journal of Medical Sciences, 15(1), 36–45. https://doi.org/10.7150/ijms.21666",
      "~ Turner, L., & Knoepfler, P. (2016). Selling stem cells in the USA: assessing the direct-to-consumer industry. Cell Stem Cell, 19(2), 154–157. Cited in Volarevic et al. (2017).",
      "~ Ethical, Legal and Social Implications: Bringing gene therapies to the clinic. (n.d.). Saint Louis University. https://www.slu.edu/law/health/blog/2024/vence-bonham-dss.php",
      "#Clinical and regulatory record",
      "~ U.S. Food and Drug Administration. (2023). Casgevy and Lyfgenia approvals for sickle cell disease.",
      "~ Vertex Pharmaceuticals & CRISPR Therapeutics. Casgevy (exagamglogene autotemcel) label and clinical programme updates, including the paediatric age expansion.",
      "~ bluebird bio. Lyfgenia (lovotibeglogene autotemcel) clinical programme and long-term follow-up.",
      "~ Comparative clinical analysis of lovotibeglogene autotemcel versus exagamglogene autotemcel, 8 December 2025.",
      "~ National Eye Institute. Autologous iPSC-derived retinal pigment epithelium patch for geographic atrophy, NCT04339764.",
      "~ Kyoto University Hospital. iPSC-derived dopaminergic progenitors for Parkinson’s disease, jRCT2090220384.",
      "~ UC San Diego. CT1-DAP001 in Parkinson’s disease, NCT06482268.",
      "~ Aspen Neuroscience. ANPD001 autologous iPSC-derived neuron replacement, ISCT 2025.",
      "~ Gameto. Fertilo iPSC-derived ovarian support cells, FDA clearance for Phase 3, January 2025.",
      "~ Heartseed & Novo Nordisk. HS-001 iPSC-derived ventricular cardiomyocytes in heart failure.",
      "~ Intellia Therapeutics. Lonvoguran ziclumeran (NTLA-2002) in hereditary angioedema, Phase 1/2 durability and safety, 2025.",
      "~ Verve Therapeutics. VERVE-102 base editing of PCSK9, Phase 1b results, 2025.",
      "~ Beam Therapeutics. BEAM-302 base editing in alpha-1 antitrypsin deficiency, March 2025.",
      "~ Centers for Medicare & Medicaid Services. Cell and Gene Therapy Access Model, August 2025.",
      "~ Institute for Clinical and Economic Review. Cost-effectiveness thresholds for sickle cell gene therapies.",
      "~ Dutch societal lifetime cost-effectiveness analysis of gene therapy versus comprehensive care in sickle cell disease.",
      "~ World Health Organization. (2021). Human genome editing: a framework for governance.",
      "~ Frontiers in Pharmacology. (2025, January). Regulatory frameworks for regenerative medicine across the United States, European Union, Japan, Canada, Australia, Taiwan and South Korea.",
      "~ International Society for Cell & Gene Therapy, Asia-Pacific Industry Committee. Regulatory roadmap for cell, tissue and gene therapy products. Cytotherapy.",
      "~ National Academies of Sciences, Engineering, and Medicine & Royal Society. International commission on heritable human genome editing.",
      "~ Second International Summit on Human Genome Editing. (2018, November). Statement on the reported germline editing of human embryos."
    ]
  }
];

export const INSPECT_ORDER = [
  "dna",
  "nucleosome",
  "cell0",
  "cell1",
  "cell2",
  "cell3",
  "cell4",
  "mol0",
  "mol5",
  "mol1",
  "mol2",
  "mol3",
  "mol4",
  "germ0",
  "germ1",
  "germ2"
];

/**
 * Inspection records for every interactive structure in the 3D world.
 * Each record drives both the hover label and the reader modal.
 */
export const INSPECT = {
  dna: {
    tag: "Genomic Target · DNA Double Helix",
    short: "DNA Double Helix",
    title: "DNA Base Pair Architecture",
    summary:
      "Deoxyribonucleic acid stores the complete genetic code of an organism in two antiparallel strands held together by paired bases. Gene therapy alters these nucleotide sequences to correct pathogenic mutations.",
    stats: [
      { value: "3.2 Gb", label: "Human haploid genome", note: "Approximately 20,000 protein-coding genes" },
      { value: "4", label: "Bases", note: "A pairs with T, G pairs with C" }
    ],
    cards: [
      {
        heading: "Mechanism",
        text: "Target genes are introduced or modified with molecular tools such as CRISPR-Cas9, base editors or AAV-delivered cassettes to restore missing cellular functions."
      },
      {
        heading: "Ethical Debate",
        text: "Distinguishes somatic modification, which affects one patient, from germline editing, which affects unborn generations."
      }
    ],
    content: [
      "#Molecular foundation",
      "The helix is the template for human biology. Reading and rewriting it offers targeted correction for inherited disorders like sickle cell disease, cystic fibrosis and severe combined immune deficiency.",
      "#Why the structure matters ethically",
      "The same chemistry supports both accepted and prohibited uses. Somatic edits are confined to a patient’s body cells; a germline edit written into this sequence would replicate in every descendant, and those descendants cannot consent.",
      "#How editing reaches this molecule",
      "Ex vivo editing removes cells, edits them in a laboratory and returns them — the path used by the first approved CRISPR therapy. In vivo editing delivers the editing agent by infusion so it acts directly on liver or other target tissue, with no cell product to batch-test and no way to recall the dose once it has acted."
    ]
  },

  nucleosome: {
    tag: "Packaging · Chromatin Unit",
    short: "Nucleosome",
    title: "Nucleosome and Chromatin Packaging",
    summary:
      "About 147 base pairs of DNA wrap twice around a histone octamer. Accessible chromatin determines whether an editing complex can reach its target at all — which is why some tissues and inactive genes are far harder to edit than others.",
    stats: [
      { value: "147 bp", label: "DNA per nucleosome", note: "Wrapped about 1.7 turns around eight histones" },
      { value: "2 m", label: "DNA per human cell", note: "Compacted into a nucleus roughly 6 µm across" }
    ],
    cards: [
      {
        heading: "Editing Accessibility",
        text: "Closed chromatin blocks editors, so delivery efficiency depends on cell state as much as on the tool itself."
      },
      {
        heading: "Regulatory Relevance",
        text: "The BCL11A enhancer edited in the first approved CRISPR therapy works precisely because it is a regulatory element, not a protein-coding gene."
      }
    ],
    content: [
      "#Compaction as a design constraint",
      "If every base pair were equally reachable, editing would be a chemistry problem. Because DNA is wound and folded, therapeutic design must choose targets in accessible or activatable regions.",
      "#Regulatory elements as targets",
      "Editing can reactivate a silenced gene instead of replacing a broken one. Sickle cell therapy uses this route: rather than repairing the beta-globin mutation, it disables an enhancer so fetal hemoglobin is produced again.",
      "#Open questions",
      "How chromatin state differs between patients, between tissues and over a lifetime is still poorly mapped, and it is a plausible source of variable response to the same therapy."
    ]
  },

  cell0: {
    tag: "Stem Cell · Pluripotent Type",
    short: "hESC",
    title: "Human Embryonic Stem Cells (hESCs)",
    summary:
      "Derived from the inner cell mass of pre-implantation blastocysts, hESCs possess pluripotency — the ability to differentiate into any cell type in the human body.",
    stats: [
      { value: "3 lineages", label: "Differentiation potential", note: "Ectoderm, mesoderm and endoderm" },
      { value: "Blastocyst", label: "Source stage", note: "Pre-implantation inner cell mass" }
    ],
    cards: [
      {
        heading: "Clinical Value",
        text: "High potential for retinal pigment epithelium replacement in macular degeneration, a first-generation success in the clinic."
      },
      {
        heading: "Ethical Core",
        text: "Harvesting destroys early-stage embryos, raising intense moral debate about the status of the embryo."
      }
    ],
    content: [
      "#Pluripotency and medical promise",
      "hESCs can replace damaged tissue in neurodegenerative disease and diabetes. Regulatory frameworks vary globally because moral views on blastocyst destruction differ, which has delayed hESC-based therapies and pushed work toward animal models.",
      "#Safety considerations",
      "Careful differentiation protocols are required before transplantation, because residual undifferentiated cells can proliferate uncontrollably and form teratomas.",
      "#Governance consequence",
      "Because sourcing is contested, several countries restricted public funding while permitting private research. The result is slower development of hESC therapies and strong commercial incentive to move to iPSC platforms."
    ]
  },

  cell1: {
    tag: "Stem Cell · Reprogrammed Type",
    short: "iPSC",
    title: "Induced Pluripotent Stem Cells (iPSCs)",
    summary:
      "Adult somatic cells — such as skin fibroblasts — engineered back into an embryonic-like pluripotent state using defined transcription factors.",
    stats: [
      { value: "115+", label: "Global trials", note: "Parkinson’s, retina, spinal cord, heart, diabetes, fertility, cancer" },
      {
        value: "63.5%",
        label: "Dopamine synthesis rise",
        note: "High-dose iPSC-derived progenitors at 24 months versus 7.0% at low dose"
      },
      { value: "Jan 2025", label: "First U.S. Phase 3", note: "Fertilo iPSC-derived ovarian support cells cleared by FDA" }
    ],
    cards: [
      {
        heading: "Ethical Breakthrough",
        text: "Bypasses embryo destruction, resolving the central moral objection raised against traditional hESC harvesting."
      },
      {
        heading: "Oncogenic Risk",
        text: "Undifferentiated iPSCs can form teratomas after transplantation, and genomic stability remains a clinical concern."
      }
    ],
    content: [
      "#Molecular reprogramming",
      "Introduced by Shinya Yamanaka, iPSCs allow patient-specific tissue generation with the potential to reduce transplant rejection. Autologous programmes such as ANPD001 aim to restore function without immunosuppression.",
      "#Where the evidence is strongest",
      "Parkinson’s disease is the most advanced efficacy signal. In a Kyoto University Hospital Phase I/II trial, 7 patients received bilateral iPSC-derived dopaminergic progenitors; at 24 months, 4 of 6 evaluable patients improved significantly, with PET confirming dopamine production and a clear dose response. A UC San Diego Phase I/II trial of CT1-DAP001 followed, with four-year follow-up.",
      "#Where the endpoint is durability",
      "For geographic atrophy, the National Eye Institute transplants a 2×4 mm autologous iPSC-derived retinal pigment epithelium patch on a biodegradable scaffold and monitors safety and graft durability for five years — the question is whether the graft survives, not whether vision is restored.",
      "#Risks and emerging concerns",
      "Beyond tumorigenicity, iPSC platforms raise genomic instability during manufacture, the prospect of human-animal chimeras, and reproductive cloning concerns. Manufacturing complexity is itself an access issue: automated, machine-learning-optimised production is now being developed precisely to make autologous therapy viable at scale."
    ]
  },

  cell2: {
    tag: "Stem Cell · Adult Multipotent Type",
    short: "MSC",
    title: "Mesenchymal Stem Cells (MSCs)",
    summary:
      "Multipotent adult stem cells isolated from bone marrow, adipose tissue or umbilical cord tissue, capable of forming bone, cartilage, fat and muscle.",
    stats: [
      {
        value: "2016",
        label: "U.S. clinic survey",
        note: "351 businesses at 570 clinics selling stem cell interventions"
      },
      { value: "Autologous", label: "Typical source", note: "Minimal ethical controversy over harvest" }
    ],
    cards: [
      {
        heading: "Immunomodulation",
        text: "Promising in trials for chronic inflammatory and autoimmune conditions through secreted anti-inflammatory cytokines."
      },
      {
        heading: "Tumorigenesis Concern",
        text: "MSCs can stimulate angiogenesis and suppress anti-tumor immune responses, which may support tumor growth and metastasis."
      }
    ],
    content: [
      "#Regenerative capacity",
      "MSCs are widely studied because harvesting raises the least ethical controversy of any stem cell source. They promote tissue repair largely by signalling rather than by replacing cells.",
      "#The commercial problem",
      "MSC clinics are also where the field is most exposed. In 2016, 351 businesses offered interventions at 570 U.S. clinics, often without adequate evidence of safety or effectiveness. Unregulated direct-to-consumer provision remains the clearest example of commercial interest outrunning evidence.",
      "#Governance lesson",
      "The MSC case shows that the risk is not only a bad molecule. It is a plausible mechanism, an appealing narrative and a paying patient with no way to distinguish an approved trial from a marketed injection."
    ]
  },

  cell3: {
    tag: "Cell Therapy · iPSC-Derived Graft",
    short: "Dopaminergic progenitor",
    title: "iPSC-Derived Dopaminergic Progenitor",
    summary:
      "A dopamine-producing neuron precursor manufactured from induced pluripotent stem cells and implanted into the brain to replace neurons lost in Parkinson’s disease.",
    stats: [
      { value: "63.5%", label: "Dopamine synthesis increase", note: "High-dose group at 24 months by PET" },
      { value: "7.0%", label: "Low-dose increase", note: "Same endpoint, showing a clear dose response" },
      {
        value: "4 of 6",
        label: "Evaluable patients improved",
        note: "Kyoto University Hospital Phase I/II, 7 patients transplanted"
      }
    ],
    cards: [
      {
        heading: "Why It Matters",
        text: "The strongest efficacy signal in the whole regenerative field, because the endpoint is a measured change in brain chemistry."
      },
      {
        heading: "Why Governance Follows",
        text: "Dose-dependent benefit raises allocation questions: if a high dose works and a low dose does not, dose becomes an equity decision."
      }
    ],
    content: [
      "#Why this cell matters to the argument",
      "Cell therapy is often defended with hope. This graft is defended with a number. A bilateral transplant of iPSC-derived dopaminergic progenitors produced significant motor improvement in 4 of 6 evaluable patients at 24 months, and PET imaging confirmed dopamine production — 63.5% higher in the high-dose group against 7.0% at low dose.",
      "#The dose problem",
      "A therapy that only works at high dose is a therapy whose cost and risk cannot be reduced without losing benefit. That converts a manufacturing parameter into an ethical one.",
      "#Open questions",
      "Long-term graft survival, the risk of dyskinesia from unregulated dopamine release, and whether autologous manufacture can be scaled far enough to serve the patient population all remain unresolved."
    ]
  },

  cell4: {
    tag: "Cell Therapy · Engineered Immune Cell",
    short: "CAR-T cell",
    title: "Engineered CAR-T Cell",
    summary:
      "A patient’s own T cells are reprogrammed with a chimeric antigen receptor so they recognise and destroy a specific target cell population.",
    stats: [
      { value: "2021", label: "First approval in India", note: "Indigenous CAR-T therapy under the centralised CLAA framework" },
      { value: "15+", label: "iPSC-derived pipeline drugs", note: "Across more than 12 companies in oncology and autoimmunity" }
    ],
    cards: [
      {
        heading: "Regulatory Model",
        text: "India’s inclusion of CAR-T under one central authority is the clearest example of a region consolidating oversight of advanced therapies."
      },
      {
        heading: "Manufacturing Reality",
        text: "Autologous manufacture means a personalised production chain, which is both a cost driver and a single point of failure."
      }
    ],
    content: [
      "#Why a CAR-T cell is in this study",
      "It is the cell therapy already licensed and priced in middle-income markets, so it previews the access questions that gene therapies will face. India brought cell- and stem-cell-derived products, gene therapeutic products and xenografts into its Centrally Licence Approving Authority framework so central and state regulators supervise them under one standard.",
      "#Platform convergence",
      "Engineered immune cells are increasingly made from iPSC lines rather than from each patient, with Fate Therapeutics and Century Therapeutics developing off-the-shelf natural killer and T-cell products; Century’s CNTY-101 is in the CARAMEL Phase I/II trial for B-cell-mediated autoimmune disease.",
      "#The ethical thread",
      "Once a therapy is manufactured rather than extracted, the ethical question shifts from what may be taken from a body to who controls the cell line, who profits from it, and whether an off-the-shelf product can be offered at a price public systems can carry."
    ]
  },

  mol0: {
    tag: "Gene Editing Tool · Molecular Scissors",
    short: "CRISPR-Cas9",
    title: "CRISPR-Cas9 Nuclease Complex",
    summary:
      "A precision tool derived from bacterial immune systems that introduces a targeted double-stranded DNA break to edit, replace or silence a gene.",
    stats: [
      { value: "Dec 2023", label: "First approval", note: "Casgevy — the first licensed CRISPR-Cas9 therapy" },
      { value: "BCL11A", label: "Target in sickle cell disease", note: "An erythroid enhancer, not a protein-coding gene" }
    ],
    cards: [
      {
        heading: "Precision",
        text: "Enables pinpoint nucleotide editing with unprecedented speed and affordability compared with earlier nuclease platforms."
      },
      {
        heading: "Off-Target Cuts",
        text: "Unintended genomic cuts can cause genomic instability or activate oncogenes, which is why candidate sites are screened exhaustively."
      }
    ],
    content: [
      "#How the complex works",
      "A guide RNA directs the Cas9 enzyme to a complementary DNA sequence, where it creates a double-strand break. Cellular repair then knocks out, corrects or inserts sequence — the mechanism behind the first approved CRISPR therapy.",
      "#Why it is ex vivo today",
      "Cutting both strands is powerful and risky. Ex vivo use lets manufacturers verify the edit in the cell product before infusion, which is why the approved therapy edits cells outside the body and returns them.",
      "#The germline boundary",
      "Heritable CRISPR modification of human embryos remains restricted internationally because off-target effects in a single edited embryo would propagate through every cell of a future person. The Second International Summit on Human Genome Editing condemned the 2018 embryo-editing episode for exactly this reason."
    ]
  },

  mol5: {
    tag: "Gene Editing Tool · Chemical Rewrite",
    short: "Base editor",
    title: "Base Editor",
    summary:
      "A modified Cas9 fused to a deaminase that chemically converts one DNA base into another — an A to G, or a C to T — without cutting both strands.",
    stats: [
      {
        value: "No DSB",
        label: "No double-strand break",
        note: "Fewer insertions, deletions and translocations than nuclease editing"
      },
      {
        value: "Mar 2025",
        label: "AATD correction",
        note: "BEAM-302 corrected the disease-causing mutation in alpha-1 antitrypsin deficiency"
      },
      { value: "50%", label: "Average LDL reduction", note: "VERVE-102 in the four highest-dose participants, 2025" }
    ],
    cards: [
      {
        heading: "Why It Is Safer",
        text: "Avoiding a double-strand break reduces the most dangerous repair outcomes, including large deletions and chromosome rearrangements."
      },
      {
        heading: "What It Cannot Do",
        text: "Base editors rewrite letters rather than replace sequences, so diseases caused by insertions, deletions or triplet repeats remain out of reach."
      }
    ],
    content: [
      "#Why this tool changes the ethics",
      "Much of the early risk argument rested on unintended cuts. A tool that edits a single letter without breaking the backbone removes the main mechanism of that harm, which weakens the strongest objection to somatic editing.",
      "#Clinical progress",
      "Beam’s BEAM-302 corrected the disease-causing mutation in alpha-1 antitrypsin deficiency in March 2025. Verve’s VERVE-102, targeting PCSK9, halved LDL cholesterol on average in the four participants at its highest dose. Base editing is being de-risked in AATD, familial hypercholesterolemia and sickle cell disease.",
      "#The residual question",
      "It does not settle germline governance. A safer tool is still a heritable edit if applied to an embryo, which is why the prohibition argument rests on consent rather than on enzyme precision."
    ]
  },

  mol1: {
    tag: "Delivery Vehicle · Viral Vector",
    short: "AAV vector",
    title: "Adeno-Associated Virus (AAV) Vector",
    summary:
      "Engineered viral shells that package and deliver therapeutic gene constructs into target cells without causing viral replication.",
    stats: [
      { value: "Non-dividing", label: "Preferred tissue targets", note: "Heart, brain, muscle and retina" },
      { value: "G0", label: "Replication", note: "Vector is stripped of viral replication genes" }
    ],
    cards: [
      {
        heading: "Delivery Efficiency",
        text: "The gold standard for delivering somatic gene therapy into non-dividing tissue such as heart or brain."
      },
      {
        heading: "Immune Response",
        text: "Pre-existing immunity or a high dose can trigger severe inflammatory side effects, and in some cases complement activation."
      }
    ],
    content: [
      "#Targeted gene delivery",
      "Viral vectors act as Trojan horses, carrying a functional gene past the cell membrane into the nucleus. Because they do not integrate, expression fades with the target cell’s turnover — sometimes a safety advantage, sometimes a durability limit.",
      "#Gonadal integration risk",
      "Inadvertent vector uptake by germ cells creates a theoretical path to unintended heritable modification, which is why biodistribution studies are required before human use.",
      "#Manufacturing and cost",
      "Vector production capacity, not molecule design, is often the bottleneck for scaling these therapies. Non-viral alternatives exist partly because viral manufacturing cannot easily be expanded.",
      "#Post-approval obligation",
      "Immune reactions that appear only at scale mean surveillance continues after licensing. Regulators increasingly require long-term follow-up registries as a licensing condition rather than a trial choice."
    ]
  },

  mol2: {
    tag: "Delivery Vehicle · Non-Viral Particle",
    short: "Lipid nanoparticle",
    title: "Lipid Nanoparticle (LNP)",
    summary:
      "Microscopic lipid vesicles engineered to encapsulate fragile mRNA or DNA and deliver it systemically without viral components.",
    stats: [
      { value: "Scalable", label: "Manufacturing", note: "Synthetic chemistry rather than cell-based vector production" },
      { value: "Low", label: "Immunogenicity", note: "No viral capsid, so no pre-existing anti-capsid immunity" }
    ],
    cards: [
      {
        heading: "Safety Profile",
        text: "Non-viral and non-infectious, with lower immunogenicity than viral capsids, though repeat dosing can still provoke reactions."
      },
      {
        heading: "Accessibility",
        text: "Scalable, cell-free manufacturing is the strongest technical argument for lowering long-term production cost."
      }
    ],
    content: [
      "#Non-viral innovation",
      "LNPs protect nucleic acids from enzymatic breakdown in the bloodstream and enable effective delivery to organs such as the liver, which is where many in-vivo editing programmes target.",
      "#Democratising access",
      "The affordability problem in gene therapy is partly a chemistry problem. Because LNPs do not require cell culture or viral packaging, scale-up economics differ fundamentally from viral vectors, and that is a direct access argument.",
      "#Limits",
      "Delivery is currently biased toward liver and certain tissues, and repeat administration can trigger immune responses. Tissue-selective delivery remains the main open problem."
    ]
  },

  mol3: {
    tag: "Therapeutic Scope · Non-Heritable",
    short: "Somatic therapy",
    title: "Somatic Cell Gene Therapy",
    summary:
      "Modifying somatic body cells — bone marrow, blood, muscle or liver — to treat the individual patient without altering reproductive germ cells.",
    stats: [
      { value: "1 person", label: "Scope of effect", note: "The change is confined to the treated patient" },
      { value: "Widely accepted", label: "Ethical status", note: "Permitted for severe disease under informed consent" }
    ],
    cards: [
      {
        heading: "Patient Impact",
        text: "Therapeutic outcomes affect only the single individual undergoing treatment, so consent is possible and sufficient in principle."
      },
      {
        heading: "Consensus",
        text: "Broadly accepted for severe debilitating disease under standard informed consent, with oversight focused on safety rather than permission."
      }
    ],
    content: [
      "#Clinical standard",
      "Somatic therapy is the basis of approved treatments for blindness, severe combined immune deficiency, sickle cell disease and beta-thalassemia. It is also the category the approved CRISPR therapy belongs to.",
      "#The consent load",
      "Consent here is heavier than a single signature. Patients weigh apheresis, myeloablative conditioning, infertility risk, a long hospital stay and decades of follow-up. Because the therapy is one-time and irreversible, one decision carries the weight that repeated decisions used to share.",
      "#Economic horizon",
      "High single-patient manufacturing costs create reimbursement and access challenges across health systems, especially where the entire price lands in one budget year."
    ]
  },

  mol4: {
    tag: "Therapeutic Scope · Heritable Boundary",
    short: "Germline editing",
    title: "Germline Gene Modification",
    summary:
      "Altering DNA in reproductive cells — sperm, eggs or early embryos — so the change is inherited by every future generation.",
    stats: [
      { value: "25 of 39", label: "Countries with legal bans", note: "A 2014 survey; four more had guideline bans" },
      { value: "106", label: "Nations surveyed", note: "Suggesting emerging consensus on prohibiting heritable editing" }
    ],
    cards: [
      {
        heading: "Intergenerational Risk",
        text: "Future offspring inherit the edit without any ability to grant informed consent."
      },
      {
        heading: "Ethical Red Line",
        text: "Opens a path toward genetic enhancement and to social disparity between those who can buy edits and those who cannot."
      }
    ],
    content: [
      "#The heritable boundary",
      "Germline editing permanently alters the human gene pool. An unintended mutation introduced today would replicate through generations with no mechanism for correction or recall.",
      "#The 2018 case",
      "In November 2018, He Jiankui announced at the Second International Summit on Human Genome Editing that he had edited human embryos to produce twins with intended HIV resistance. The claims were unverified, and organizers condemned the work as deeply disturbing and irresponsible, citing inadequate medical indication, poor design, failure to meet ethical standards and a lack of transparency in development, review and conduct.",
      "#The prohibition landscape",
      "The Council of Europe’s Oviedo Convention prohibits heritable genome modification. UNESCO’s International Bioethics Committee called for a moratorium in 2015. In the United States, a de facto ban operates through appropriations provisions and NIH funding restrictions rather than statute. The result is a patchwork of bans, ambiguous rules and unenforceable guidelines.",
      "#Why consent is the decisive argument",
      "A safer editing tool does not resolve the objection. The people who would carry the edit cannot be asked, and no current governance mechanism can obtain consent from a future generation."
    ]
  },

  germ0: {
    tag: "Bacterial Host · Recombinant Vector Host",
    short: "E. coli",
    title: "Escherichia coli Expression Host",
    summary:
      "A bacterial organism widely used in biotechnology to clone, amplify and mass-produce the recombinant DNA plasmids required for gene therapy manufacturing.",
    stats: [
      { value: "Endotoxin", label: "Primary impurity risk", note: "Lipopolysaccharide must be removed before human use" },
      { value: "Plasmid", label: "Product", note: "Therapeutic DNA rings multiplied before packaging" }
    ],
    cards: [
      {
        heading: "Plasmid Factory",
        text: "Replicates therapeutic DNA constructs before viral packaging or non-viral encapsulation."
      },
      {
        heading: "Bio-Safety Risk",
        text: "Requires stringent purification to remove bacterial endotoxins that provoke dangerous human immune responses."
      }
    ],
    content: [
      "#Bacterial bio-manufacturing",
      "E. coli is the biological workhorse for synthesising gene constructs. Recombinant plasmids are multiplied in bacterial culture and harvested before packaging into vectors or nanoparticles.",
      "#Purity and quality control",
      "Residual bacterial impurities or endotoxins can cause severe inflammation or sepsis, which is why FDA and EMA batch testing is mandatory and detailed. This is also why a release-testing failure can halt an entire production lot.",
      "#Governance relevance",
      "Most of the safety machinery in cell and gene therapy is invisible to patients: it sits in purification, sterility and release testing. Regulatory accountability largely means accountability for these process steps."
    ]
  },

  germ1: {
    tag: "Viral Pathogen · Integrating Vector",
    short: "Lentiviral vector",
    title: "Retrovirus / Lentivirus Vector",
    summary:
      "An RNA virus engineered to reverse-transcribe its cargo and integrate a therapeutic gene permanently into host chromosomes.",
    stats: [
      { value: "Permanent", label: "Expression", note: "Integrated edits are inherited by daughter cells" },
      {
        value: "SIN",
        label: "Modern design",
        note: "Self-inactivating vectors reduce, but do not eliminate, mutagenic risk"
      }
    ],
    cards: [
      {
        heading: "Permanent Expression",
        text: "Integration into the target genome ensures the correction is passed to daughter cells, which suits stem cell therapy."
      },
      {
        heading: "Insertional Mutagenesis",
        text: "Random insertion can disrupt tumour suppressor genes or activate proto-oncogenes, a risk demonstrated in early trials."
      }
    ],
    content: [
      "#Genomic integration dynamics",
      "Lentiviral vectors infect non-dividing cells such as stem cells and neurons, treating severe blood disorders including beta-thalassemia and sickle cell disease. Lyfgenia uses this approach to insert a modified beta-globin gene.",
      "#Ethical and clinical oversight",
      "Early gene therapy trials demonstrated insertional oncogenesis when insertion activated an oncogene. Modern self-inactivating vectors significantly reduce, but do not completely eliminate, that risk — which is why long-term follow-up persists for the patient’s lifetime.",
      "#Where the trail leads",
      "Adverse events can appear years after treatment, beyond any trial endpoint. Registry-based surveillance is therefore an ethical requirement, not a research convenience."
    ]
  },

  germ2: {
    tag: "Viral Pathogen · Oncolytic Vector",
    short: "Oncolytic adenovirus",
    title: "Recombinant Oncolytic Adenovirus",
    summary:
      "A genetically modified virus engineered to infect, replicate within and lyse cancer cells while sparing normal tissue.",
    stats: [
      { value: "Tumour-selective", label: "Replication", note: "Exploits altered innate immune pathways in tumour cells" },
      { value: "Biosafety", label: "Containment", note: "Shedding rules govern exposure risk to others" }
    ],
    cards: [
      {
        heading: "Targeted Lysis",
        text: "Ruptures tumour cells and releases tumour antigens, triggering an immune response across the microenvironment."
      },
      {
        heading: "Containment Protocols",
        text: "Requires strict biosafety and shedding guidelines to prevent environmental release or transmission to immunocompromised contacts."
      }
    ],
    content: [
      "#Virotherapy mechanisms",
      "Oncolytic viruses exploit the altered innate immune signalling of tumour cells to multiply selectively, causing cell death and releasing immunogenic tumour antigens that recruit the immune system.",
      "#Public health governance",
      "Because the agent is a replicating virus, treatment raises questions beyond the patient: shedding, contact exposure and environmental release. This is the clearest case in the field where informed consent must include risk to others.",
      "#Why it belongs in the ethics discussion",
      "It shows that gene-based medicine is not a single category. The obligations attached to a replicating virus differ from those attached to an edited cell product or a synthetic particle, even though all are described as gene therapy."
    ]
  }
};