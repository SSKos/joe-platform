require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Author = require('./models/author');
const Article = require('./models/article');
const Revision = require('./models/revision');
const Organisation = require('./models/organisation');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/JOEdb';

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clean existing data
  await Promise.all([
    Author.deleteMany({}),
    Article.deleteMany({}),
    Revision.deleteMany({}),
    Organisation.deleteMany({}),
  ]);
  console.log('Cleared existing data');

  // Create organisations
  const [uniMoscow, uniOxford, uniMIT] = await Organisation.insertMany([
    { fullTitle: 'Moscow State University', shortTitle: 'MSU', address: 'Moscow, Russia' },
    { fullTitle: 'University of Oxford', shortTitle: 'Oxford', address: 'Oxford, UK' },
    { fullTitle: 'Massachusetts Institute of Technology', shortTitle: 'MIT', address: 'Cambridge, MA, USA' },
  ]);

  // Create authors
  const passwordHash = await bcrypt.hash('Password123', 10);
  const [author1, author2, author3] = await Author.insertMany([
    {
      email: 'ivan.petrov@msu.ru',
      password: passwordHash,
      mobile: '9161234567',
      firstName: 'Ivan',
      middleName: 'Sergeyevich',
      familyName: 'Petrov',
      scientificDegree: 'PhD',
      about: 'Researcher in computational biology and genomics at Moscow State University.',
      institutions: [uniMoscow._id],
      categories: ['Biological Sciences', 'Genetics and Genomics'],
      reviewer: true,
    },
    {
      email: 'emily.watson@ox.ac.uk',
      password: passwordHash,
      mobile: '9261234567',
      firstName: 'Emily',
      familyName: 'Watson',
      scientificDegree: 'Professor',
      about: 'Professor of Neuroscience at the University of Oxford with 20 years of research experience.',
      institutions: [uniOxford._id],
      categories: ['Neuroscience', 'Medicine and Health Sciences'],
      reviewer: true,
    },
    {
      email: 'james.chen@mit.edu',
      password: passwordHash,
      mobile: '9371234567',
      firstName: 'James',
      familyName: 'Chen',
      scientificDegree: 'Associate Professor',
      about: 'Associate Professor of Physics and Materials Science at MIT.',
      institutions: [uniMIT._id],
      categories: ['Physical Sciences', 'Engineering and Technology'],
      reviewer: true,
    },
  ]);
  console.log('Authors created:', [author1.email, author2.email, author3.email]);

  const abstractText1 = `Background: CRISPR-Cas9 genome editing has revolutionized biomedical research, yet its application in correcting complex polygenic disorders remains poorly understood. This study investigates the efficacy of multiplexed CRISPR editing in a murine model of metabolic syndrome, targeting three key regulatory loci simultaneously.

Methods: We employed a novel ribonucleoprotein delivery system to co-deliver three guide RNAs targeting Pparg, Fasn, and Lepr in C57BL/6J mice. Editing efficiency was assessed via deep sequencing, metabolic parameters were measured at 4, 8, and 16 weeks post-injection, and off-target effects were evaluated using GUIDE-seq.

Results: Multiplexed editing achieved 67–82% on-target efficiency across all three loci with minimal indel heterogeneity. Edited animals demonstrated significant reductions in fasting glucose (34%, p<0.001), plasma triglycerides (41%, p<0.001), and adipose tissue mass (28%, p<0.01) compared to controls at 16 weeks. Off-target analysis identified four low-frequency events, none within coding exons.

Conclusions: Simultaneous CRISPR correction of three metabolic regulatory genes produces durable phenotypic improvement in murine metabolic syndrome without detectable exonic off-target mutations. These findings establish proof-of-concept for multiplexed somatic gene editing as a therapeutic strategy for polygenic metabolic disorders and warrant further investigation in larger animal models prior to clinical translation.`;

  const abstractText2 = `Background: Chronic neuroinflammation is a hallmark of Alzheimer's disease (AD), yet the causal relationship between microglial activation states and disease progression remains contested. This longitudinal study characterises microglial transcriptomic trajectories in post-mortem human brain tissue across Braak staging I–VI.

Methods: Single-nucleus RNA sequencing was performed on 128,000 nuclei isolated from the prefrontal cortex and hippocampus of 42 donors spanning Braak stages I to VI and 10 age-matched controls. Microglial subclusters were identified and validated using spatial transcriptomics. Ligand-receptor interaction analysis was performed using CellChat.

Results: We identified seven transcriptomically distinct microglial states, including a novel disease-associated state (DAM-3) enriched at Braak III–IV characterised by upregulation of complement pathway genes (C1QA, C1QB, C3) and downregulation of homeostatic markers (P2RY12, TMEM119). DAM-3 abundance correlated negatively with synaptic density scores (r = −0.71, p<0.0001). Spatial transcriptomics confirmed DAM-3 localisation adjacent to amyloid plaques. CellChat analysis revealed increased SPP1-CD44 signalling between DAM-3 and dystrophic neurons.

Conclusions: The identification of DAM-3 as a stage-specific microglial subtype with synaptic-pruning-associated gene expression suggests a mechanistic link between complement-driven neuroinflammation and synaptic loss in AD. DAM-3 markers represent candidate biomarkers and therapeutic targets for mid-stage intervention strategies.`;

  const abstractText3 = `Background: Topological insulators represent a class of quantum materials with conducting surface states protected by time-reversal symmetry, promising for dissipationless electronics. However, scalable synthesis of high-quality topological insulator thin films with controlled surface-to-bulk ratio remains a significant challenge.

Methods: We developed a molecular beam epitaxy protocol for Bi2Te3/Bi2Se3 superlattice heterostructures on SrTiO3(111) substrates. Film quality was characterised using RHEED, XRD, and cross-sectional STEM. Surface transport was isolated using ionic liquid gating, and magnetotransport measurements were conducted at temperatures from 2 K to 300 K in magnetic fields up to 14 T.

Results: Superlattice films exhibited atomically sharp interfaces confirmed by STEM-EELS. Ionic gating successfully tuned the Fermi level into the bulk bandgap, revealing a linear magnetoresistance (LMR) of 340% at 14 T and 2 K, attributable to topological surface state transport. Shubnikov-de Haas oscillations yielded a Berry phase of π, confirming Dirac fermion character. Surface mobility reached 4,200 cm²/V·s at 2 K, a threefold improvement over single-compound films.

Conclusions: Bi2Te3/Bi2Se3 superlattice heterostructures enable simultaneous enhancement of surface-state mobility and suppression of bulk conduction, establishing a viable platform for room-temperature topological electronics. The ionic gating methodology provides a reproducible route for surface-selective transport measurements applicable to other topological material families.`;

  // Create revisions
  const [rev1, rev2, rev3] = await Revision.insertMany([
    {
      articleID: new mongoose.Types.ObjectId(), // placeholder, will be updated
      status: 'Submitted',
      categories: ['Biological Sciences', 'Genetics and Genomics'],
      authors: [{ author: author1._id, organisations: [uniMoscow._id] }],
      articleTitle: 'Multiplexed CRISPR-Cas9 Editing of Three Metabolic Regulatory Loci Ameliorates Polygenic Metabolic Syndrome in Murine Models',
      abstract: abstractText1,
      articleType: 'original research',
      articleDoc: 'uploads/test_article.pdf',
      ratingByAuthor: 4,
      conflictDisclosure: 'The authors declare no conflict of interest. This study was funded by RSF grant 22-14-00123.',
      authorsInput: 'I.S. Petrov: conceptualization, methodology, writing. Co-authors: data curation, review and editing.',
      ethicStatement: 'All animal procedures were approved by the MSU Institutional Animal Care and Use Committee (protocol #2024-017) and conducted in accordance with EU Directive 2010/63/EU.',
    },
    {
      articleID: new mongoose.Types.ObjectId(),
      status: 'Submitted',
      categories: ['Neuroscience', 'Medicine and Health Sciences'],
      authors: [{ author: author2._id, organisations: [uniOxford._id] }],
      articleTitle: 'Single-Nucleus Transcriptomics Reveals a Novel Disease-Associated Microglial State Linked to Synaptic Loss Across Alzheimer\'s Disease Braak Stages',
      abstract: abstractText2,
      articleType: 'original research',
      articleDoc: 'uploads/test_article.pdf',
      ratingByAuthor: 5,
      conflictDisclosure: 'E. Watson has received speaker honoraria from Pfizer unrelated to this work. All other authors declare no competing interests. Funded by Wellcome Trust grant 221890/Z/20/Z.',
      authorsInput: 'E. Watson: conceptualization, supervision, funding acquisition, writing – original draft. All authors contributed to data interpretation and manuscript revision.',
      ethicStatement: 'Human post-mortem brain tissue was obtained from the Oxford Brain Bank under ethics approval 15/SC/0639. Informed consent was obtained from all donors or their legal representatives.',
    },
    {
      articleID: new mongoose.Types.ObjectId(),
      status: 'Submitted',
      categories: ['Physical Sciences', 'Engineering and Technology'],
      authors: [{ author: author3._id, organisations: [uniMIT._id] }],
      articleTitle: 'High-Mobility Topological Surface States in Bi2Te3/Bi2Se3 Superlattice Heterostructures via Ionic Liquid Gating',
      abstract: abstractText3,
      articleType: 'original research',
      articleDoc: 'uploads/test_article.pdf',
      ratingByAuthor: 4,
      conflictDisclosure: 'The authors declare no competing financial interests. This work was supported by NSF DMR-2118448 and DOE DE-SC0021940.',
      authorsInput: 'J. Chen: conceptualization, MBE growth, manuscript writing. All authors participated in data analysis and manuscript preparation.',
      ethicStatement: 'This study does not involve human subjects or animal experiments. All materials used are commercially available or synthesized under standard laboratory safety protocols.',
    },
  ]);

  // Create articles in Published state, linking revisions
  const now = new Date();
  const [article1, article2, article3] = await Article.insertMany([
    {
      submittingAuthor: author1._id,
      state: 'Published',
      revisions: [rev1._id],
      submittanceDateTime: new Date(now - 45 * 24 * 60 * 60 * 1000),
      publicationDateTime: new Date(now - 5 * 24 * 60 * 60 * 1000),
    },
    {
      submittingAuthor: author2._id,
      state: 'Published',
      revisions: [rev2._id],
      submittanceDateTime: new Date(now - 60 * 24 * 60 * 60 * 1000),
      publicationDateTime: new Date(now - 12 * 24 * 60 * 60 * 1000),
    },
    {
      submittingAuthor: author3._id,
      state: 'Published',
      revisions: [rev3._id],
      submittanceDateTime: new Date(now - 38 * 24 * 60 * 60 * 1000),
      publicationDateTime: new Date(now - 2 * 24 * 60 * 60 * 1000),
    },
  ]);

  // Update revisions with correct articleIDs
  await Promise.all([
    Revision.findByIdAndUpdate(rev1._id, { articleID: article1._id }),
    Revision.findByIdAndUpdate(rev2._id, { articleID: article2._id }),
    Revision.findByIdAndUpdate(rev3._id, { articleID: article3._id }),
  ]);

  // Link articles to authors
  await Promise.all([
    Author.findByIdAndUpdate(author1._id, { $set: { articles: [article1._id] } }),
    Author.findByIdAndUpdate(author2._id, { $set: { articles: [article2._id] } }),
    Author.findByIdAndUpdate(author3._id, { $set: { articles: [article3._id] } }),
  ]);

  console.log('Seed complete!');
  console.log('\nTest accounts (password: Password123):');
  console.log('  ivan.petrov@msu.ru');
  console.log('  emily.watson@ox.ac.uk');
  console.log('  james.chen@mit.edu');
  console.log('\nPublished articles:', [article1._id, article2._id, article3._id].map(id => id.toString()));

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
