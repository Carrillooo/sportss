import json, random
random.seed(7)
Q=[]
TD0={'proximal':'closer to the trunk','distal':'further from the trunk','medial':'closer to the midline','lateral':'further from the midline','superior':'above','inferior':'below','anterior':'in front','posterior':'behind'}
def add(topic,img,q,opts,ans,expl,fix=0):
    assert ans in opts, (q,ans,opts)
    assert len(set(opts))==len(opts), opts
    Q.append([topic,img,q,opts,opts.index(ans),expl]+([1] if fix else []))
def pick(pool,correct,n=3):
    p=[x for x in dict.fromkeys(pool) if x!=correct]; random.shuffle(p); return p[:n]

# ================= PICTURE: labelled diagrams =================
IMGS = {
 'neuron':('Picture: neuron','The diagram shows a neuron.',{
   'A':('dendrite','Dendrites link the neuron to other neurons and receive information.'),
   'B':('soma (cell body)','The soma is the cell body, found in the spinal cord or in ganglia.'),
   'C':('myelin sheath','Myelin insulates the electrical signal from surrounding tissues.'),
   'D':('node of Ranvier','Nodes of Ranvier are gaps in the myelin that aid transmission.'),
   'E':('axon terminal','The axon terminal is where the neuron meets the next cell, e.g. at the neuromuscular junction.')}),
 'reflex':('Picture: nerves','The diagram shows the pathway when a hand touches a flame.',{
   'A':('receptor','The receptor detects the stimulus and generates a nerve impulse.'),
   'B':('afferent (sensory) neuron','Afferent neurons carry information from receptors to the CNS.'),
   'C':('interneuron','Interneurons link afferent neurons to motoneurons, with an excitatory or inhibitory effect.'),
   'D':('efferent (motor) neuron','Efferent neurons carry commands from the CNS to effectors.'),
   'E':('effector (muscle)','The effector carries out the response, here a muscle contracting.')}),
 'brain':('Picture: brain','The diagram shows a section through the brain.',{
   'A':('diencephalon','The diencephalon (thalamus and hypothalamus) controls the internal environment.'),
   'B':('cerebellum','The cerebellum coordinates balance and fine motor control.'),
   'C':('brain stem','The brain stem connects brain and spinal cord and controls breathing and heart rate.'),
   'D':('cerebral cortex','The cerebral cortex controls conscious thought, voluntary movement and perception.')}),
 'fascia':('Picture: fascia','The diagram shows a skeletal muscle attached to a bone.',{
   'A':('epimysium','The epimysium is the outer layer covering the entire muscle.'),
   'B':('perimysium','The perimysium surrounds bundles of fibres (fascicles).'),
   'C':('endomysium','The endomysium covers each individual muscle fibre.'),
   'D':('tendon','The tendon connects muscle to bone and transmits force.')}),
 'bone':('Picture: bone','The diagram shows a long bone (femur).',{
   'A':('proximal epiphysis','The epiphysis is the end of a long bone, made of spongy bone.'),
   'B':('diaphysis','The diaphysis is the shaft, made of compact bone.'),
   'C':('articular cartilage','Articular cartilage reduces friction between bones at the joint.'),
   'D':('spongy (cancellous) bone','Spongy bone has a latticework structure with many spaces.'),
   'E':('compact bone','Compact bone is solid and dense, important for support and protection.')}),
 'front':('Picture: muscles front','The diagram shows the anterior muscles of the body.',{
   'A':('deltoid','The deltoid abducts the shoulder.'),
   'B':('pectoralis major','The pectorals pair with the latissimus dorsi.'),
   'C':('biceps brachii','The biceps flexes the elbow; its antagonist is the triceps.'),
   'D':('rectus abdominis','The rectus abdominis flexes the trunk; its antagonist is the erector spinae.'),
   'E':('quadriceps','The quadriceps extend the knee; their antagonist is the hamstrings.'),
   'F':('tibialis anterior','The tibialis anterior dorsiflexes the ankle.')}),
 'back':('Picture: muscles back','The diagram shows the posterior muscles of the body.',{
   'A':('trapezius','The trapezius is on the upper back; trapezius/deltoids is a common pair.'),
   'B':('latissimus dorsi','The latissimus dorsi adducts and extends the shoulder.'),
   'C':('gluteus maximus','The gluteus maximus extends the hip.'),
   'D':('hamstrings','The hamstrings flex the knee and are antagonists to the quadriceps.'),
   'E':('gastrocnemius','The gastrocnemius plantar flexes the ankle.'),
   'F':('triceps brachii','The triceps extends the elbow.')}),
 'skeleton':('Picture: skeleton','The diagram shows the human skeleton.',{
   'A':('skull (cranium)','The skull protects the brain (axial skeleton).'),
   'B':('clavicle','The clavicle and scapula form the pectoral girdle.'),
   'C':('sternum','The sternum is a flat bone that protects the heart and lungs.'),
   'D':('scapula','The scapula is a flat bone and part of the pectoral girdle.'),
   'E':('rib cage','The ribs protect the heart and lungs (axial skeleton).'),
   'F':('humerus','The humerus is the upper-arm long bone.'),
   'G':('radius','The radius is a forearm bone; with the carpals it forms the wrist.'),
   'H':('pelvic bone','The pelvis (ilium, ischium, pubis) forms the hip joint with the femur.'),
   'I':('carpals','Carpals are short bones in the wrist.'),
   'J':('femur','The femur is the thigh bone, a long bone.'),
   'K':('patella','The patella is the kneecap.'),
   'L':('tibia','The tibia is the shin bone; with the femur it forms the knee joint.'),
   'M':('fibula','The fibula is the thin lower-leg bone lateral to the tibia.'),
   'N':('tarsals','Tarsals are short bones in the ankle and foot.'),
   'O':('sacrum','The sacrum is an irregular bone made of 5 fused vertebrae.'),
   'P':('cervical vertebrae','There are 7 cervical vertebrae in the neck.'),
   'Q':('thoracic vertebrae','There are 12 thoracic vertebrae, attached to the ribs.')}),
 'armbones':('Picture: arm bones','The diagram shows the bones of the upper limb.',{
   'A':('humerus','The humerus is the long bone of the upper arm.'),
   'B':('radius','The radius is on the thumb side of the forearm.'),
   'C':('ulna','The ulna is on the little-finger side; its upper end forms the elbow with the humerus.'),
   'D':('carpals','Carpals are short bones in the wrist.'),
   'E':('metacarpals','Metacarpals are the long bones of the palm.'),
   'F':('phalanges','Phalanges are the finger bones.')}),
 'legbones':('Picture: leg bones','The diagram shows the bones of the lower limb.',{
   'A':('femur','The femur is the thigh bone.'),
   'B':('patella','The patella is the kneecap.'),
   'C':('tibia','The tibia is the shin bone.'),
   'D':('fibula','The fibula is the thin bone beside the tibia.'),
   'E':('tarsals','Tarsals are short bones of the ankle.'),
   'F':('metatarsals','Metatarsals are long bones of the foot.'),
   'G':('phalanges','Phalanges are the toe bones.')}),
 'anatomical':('Picture: anatomical terms','The figure shows the anatomical position with direction labels.',{
   'A':('posterior','Posterior = behind (dorsal).'),
   'B':('anterior','Anterior = in front (ventral).'),
   'C':('superior','Superior = above (towards the head).'),
   'D':('inferior','Inferior = below (towards the feet).'),
   'E':('proximal','Proximal = closer to the trunk.'),
   'F':('distal','Distal = further from the trunk.'),
   'G':('medial','Medial = closer to the midline.'),
   'H':('lateral','Lateral = further from the midline.')}),
 'jointtypes':('Picture: synovial joints','The figure shows the six types of synovial joint.',{
   'A':('plane (gliding) joint','Plane joints permit gliding or sliding movements, e.g. the acromioclavicular joint.'),
   'B':('pivot joint','Pivot joints permit rotation, e.g. the atlanto-axial joint.'),
   'C':('hinge joint','Hinge joints permit flexion and extension only, e.g. the elbow.'),
   'D':('saddle joint','Saddle joints permit movement in two planes, e.g. the thumb (carpometacarpal).'),
   'E':('ball and socket joint','Ball and socket joints are multiaxial, e.g. the hip.'),
   'F':('condyloid joint','Condyloid joints permit flexion, extension, abduction, adduction and circumduction, e.g. knuckles.')}),
 'nstree':('Picture: nervous system','The diagram shows the organisation of the nervous system.',{
   'A':('central nervous system','The CNS is the brain and spinal cord.'),
   'B':('peripheral nervous system','The PNS is all the nerves outside the CNS.'),
   'C':('autonomic nervous system','The autonomic system controls internal organs and glands (involuntary).'),
   'D':('somatic nervous system','The somatic system controls voluntary muscles.'),
   'E':('sympathetic division','The sympathetic division is arousing (fight or flight).'),
   'F':('parasympathetic division','The parasympathetic division is calming (rest and digest).'),
   'G':('sensory (afferent) nerves','Sensory nerves carry input to the CNS.'),
   'H':('motor (efferent) nerves','Motor nerves carry output from the CNS.')}),
 'bonestruct':('Picture: bone','The diagram shows the internal structure of a long bone.',{
   'A':('spongy bone','Spongy (cancellous) bone has a latticework with many spaces.'),
   'B':('compact bone','Compact bone is solid and dense.'),
   'C':('articular cartilage','Cartilage at the bone end reduces friction.'),
   'D':('periosteum','The periosteum is the membrane covering the outside of the bone.'),
   'E':('red bone marrow','Red marrow produces blood cells (haemopoiesis).'),
   'F':('yellow bone marrow','Yellow marrow stores fat, an energy store.')}),
 'handmoves':('Picture: movements','Each panel shows a movement of the thumb.',{
   '1':('abduction','Abduction moves away from the midline of the hand.'),
   '2':('adduction','Adduction moves back towards the midline.'),
   '3':('extension','Extension increases the angle at the joint.'),
   '4':('flexion','Flexion decreases the angle at the joint.')}),
 'anklemoves':('Picture: movements','The figure shows four movements of the foot and ankle.',{
   '1':('dorsiflexion','Dorsiflexion brings the toes up towards the shin.'),
   '2':('plantar flexion','Plantar flexion points the toes down.'),
   '3':('eversion','Eversion turns the sole of the foot outwards.'),
   '4':('inversion','Inversion turns the sole of the foot inwards.')}),
}
for img,(topic,intro,items) in IMGS.items():
    letters=list(items); names=[v[0] for v in items.values()]
    for L,(name,fact) in items.items():
        opts=sorted([L]+pick(letters,L))
        if img in ('handmoves','anklemoves'):
            q1=f"{intro} Which panel shows {name}?"; q2=f"{intro} Which movement is shown in panel {L}?"
        elif img=='anatomical':
            q1=f"{intro} Which letter shows the direction '{name}'?"; q2=f"{intro} What does label {L} mean?"
            names2=[f"{n.capitalize()} ({TD0[n]})" for n in names]; 
            add(topic,img,q1,opts,L,f"{L} = {name}. {fact}",fix=1)
            nm=f"{name.capitalize()} ({TD0[name]})"; add(topic,img,q2,[nm]+pick(names2,nm),nm,f"{L} = {name}. {fact}"); continue
        else:
            q1=f"{intro} Which letter labels the {name}?"; q2=f"{intro} What is structure {L}?"
        add(topic,img,q1,opts,L,f"{L} is the {name}. {fact}",fix=1)
        add(topic,img,q2,[name]+pick(names,name),name,f"{L} is the {name}. {fact}")

# extra picture questions (hand-written)
P=lambda *a,**k: add(*a,**k)
P('Picture: synovial joints','jointtypes',"Joint type E is found at the hip. Which movements does it allow?",["Flexion/extension only","Movement around several axes, including rotation","Gliding only","No movement"],"Movement around several axes, including rotation","E is a ball and socket joint: a rounded head in a concavity allows movement on several axes.")
P('Picture: synovial joints','jointtypes',"Joint type C is found at the elbow. Which movements does it allow?",["Flexion and extension only","Rotation only","Abduction and adduction only","Circumduction"],"Flexion and extension only","C is a hinge joint (uniaxial).")
P('Picture: synovial joints','jointtypes',"Joint type B allows the head to turn from side to side (atlas and axis). What type is it?",["Pivot","Hinge","Saddle","Plane"],"Pivot","B is a pivot joint: a rounded process fits into a bony ring, permitting rotation.")
P('Picture: synovial joints','jointtypes',"Which labelled joint type is found at the knee and ankle according to your class table?",["A","C","E","F"],"C","The knee and ankle are classified as hinge joints (C).",fix=1)
P('Picture: synovial joints','jointtypes',"Which labelled joint type gives the MOST mobility and therefore the least stability?",["A","B","C","E"],"E","Ball and socket joints (E) are multiaxial: most movement, least stability.",fix=1)
P('Picture: synovial joints','jointtypes',"All six joints in this figure share which feature?",["A joint cavity (synovial joint)","No movement","Fibrous tissue between bones","Cartilage only, no cavity"],"A joint cavity (synovial joint)","They are all synovial joints, which have a joint cavity.")
P('Picture: brain','brainstem',"Structures X, Y and Z together form which part of the brain?",["Brain stem","Cerebellum","Diencephalon","Cerebral cortex"],"Brain stem","Midbrain (X), pons (Y) and medulla (Z) make up the brain stem.")
P('Picture: brain','brainstem',"The region formed by X, Y and Z regulates which functions?",["Breathing, heart rate and blood pressure","Balance and coordination","Conscious thought","Body temperature and hunger"],"Breathing, heart rate and blood pressure","The brain stem regulates basic life functions.")
P('Picture: brain','brainstem',"Structure Z continues downwards into the…",["Spinal cord","Cerebellum","Thalamus","Cerebral cortex"],"Spinal cord","The brain stem connects the brain to the spinal cord.")
P('Picture: autonomic','ansdiagram',"Division Y increases heart rate, relaxes airways and secretes adrenaline. Division Y is the…",["Sympathetic nervous system","Parasympathetic nervous system","Somatic nervous system","Central nervous system"],"Sympathetic nervous system","These are 'fight or flight' responses of the sympathetic system.")
P('Picture: autonomic','ansdiagram',"Division X decreases heart rate and stimulates digestion. Division X is the…",["Sympathetic nervous system","Parasympathetic nervous system","Somatic nervous system","Afferent division"],"Parasympathetic nervous system","These are 'rest and digest' responses.")
P('Picture: autonomic','ansdiagram',"Which division would dominate during the last 200 m of an 800 m race?",["Division X","Division Y","Neither","Both equally"],"Division Y","Exercise activates the sympathetic division (Y).",fix=1)
P('Picture: autonomic','ansdiagram',"Which division would dominate while an athlete rests and eats after training?",["Division X","Division Y","Neither","Both equally"],"Division X","Recovery and digestion are parasympathetic (X).",fix=1)
P('Picture: autonomic','ansdiagram',"Both divisions in this diagram belong to the…",["Autonomic nervous system","Somatic nervous system","Central nervous system","Sensory nervous system"],"Autonomic nervous system","Sympathetic and parasympathetic are the two divisions of the ANS.")
P('Picture: autonomic','ansdiagram',"According to the diagram, what does Division Y do to the airways and why is this useful in exercise?",["Relaxes (dilates) them so more air can flow","Constricts them to save energy","Has no effect","Fills them with mucus"],"Relaxes (dilates) them so more air can flow","Sympathetic activity dilates airways to increase ventilation.")
P('Picture: nervous system','cnspns',"Group A (brain and spinal cord) forms the…",["Central nervous system","Peripheral nervous system","Autonomic nervous system","Somatic nervous system"],"Central nervous system","CNS = brain + spinal cord.")
P('Picture: nervous system','cnspns',"Group B (cranial nerves, spinal nerves and sensory organs) forms the…",["Central nervous system","Peripheral nervous system","Diencephalon","Brain stem"],"Peripheral nervous system","The PNS is everything outside the brain and spinal cord.")
P('Picture: nervous system','cnspns',"What is the main role of Group A?",["Interpret sensory information and coordinate responses","Carry signals only from the skin","Produce blood cells","Store calcium"],"Interpret sensory information and coordinate responses","The CNS is the main control centre.")
P('Picture: nervous system','cnspns',"What is the main role of Group B?",["Transmit signals between the CNS and the rest of the body","Make conscious decisions","Store memories","Control balance"],"Transmit signals between the CNS and the rest of the body","The PNS connects the CNS to muscles, organs and sensory structures.")
P('Picture: movements','shouldermoves',"Figure Y shows the arm raised forwards at the shoulder. This movement is…",["Flexion","Extension","Abduction","Adduction"],"Flexion","Raising the arm forwards is shoulder flexion.")
P('Picture: movements','shouldermoves',"Figure X shows the arm moved backwards behind the body. This movement is…",["Flexion","Extension","Abduction","Internal rotation"],"Extension","Moving the arm backwards is shoulder extension.")
P('Picture: movements','shouldermoves',"The movements in X and Y happen in which plane?",["Sagittal plane","Frontal plane","Transverse plane","Horizontal plane"],"Sagittal plane","Flexion and extension occur in the sagittal plane.")
P('Picture: movements','rotation',"Image 1 shows the shoulders turning outwards (retraction). Which rotation is this?",["External (lateral) rotation","Internal (medial) rotation","Circumduction","Inversion"],"External (lateral) rotation","Rotation away from the midline is external rotation.")
P('Picture: movements','rotation',"Image 2 shows the shoulders turning inwards (protraction). Which rotation is this?",["External rotation","Internal rotation","Abduction","Extension"],"Internal rotation","Rotation towards the midline is internal rotation.")
P('Picture: movements','rotation',"Rotation movements like those shown happen in which plane?",["Sagittal","Frontal","Transverse","Coronal"],"Transverse","Rotation occurs in the transverse plane around a vertical axis.")
P('Picture: movements','horizontal',"Top view: arrow X shows the arm moving forwards across the body at shoulder height. This is…",["Horizontal flexion","Horizontal extension","Abduction","Plantar flexion"],"Horizontal flexion","Moving the arm forwards in the horizontal plane is horizontal flexion.")
P('Picture: movements','horizontal',"Top view: arrow Y shows the arm moving backwards at shoulder height. This is…",["Horizontal flexion","Horizontal extension","Adduction","Dorsiflexion"],"Horizontal extension","Moving the arm backwards in the horizontal plane is horizontal extension.")
P('Picture: movements','anklemoves',"In panel 1 the toes move towards the shin. Which muscle is the agonist?",["Tibialis anterior","Gastrocnemius","Soleus","Hamstrings"],"Tibialis anterior","Dorsiflexion: tibialis anterior is the agonist.")
P('Picture: movements','anklemoves',"In panel 2 the foot points downwards. Which muscles are the agonists?",["Gastrocnemius and soleus","Tibialis anterior","Quadriceps","Iliopsoas"],"Gastrocnemius and soleus","Plantar flexion is produced by the calf muscles.")
P('Picture: movements','anklemoves',"A footballer rolls their ankle, turning the sole of the foot inwards. Which panel shows this movement?",["1","2","3","4"],"4","Inversion (panel 4) turns the sole inwards, the common ankle sprain movement.",fix=1)
P('Picture: bone types','longbones',"The bones highlighted in red are mainly…",["Long bones","Short bones","Flat bones","Irregular bones"],"Long bones","Femur, tibia, humerus and other limb bones are long bones, the most important for movement.")
P('Picture: bone types','longbones',"What is the main function of the type of bone highlighted?",["Movement (acting as levers)","Protection of organs","Producing all of the body's heat","Connecting muscle to bone"],"Movement (acting as levers)","Long bones are the most important bones for movement.")
P('Picture: bone types','shortbones',"The bones highlighted at the wrist (carpus) and ankle (tarsus) are…",["Long bones","Short bones","Flat bones","Irregular bones"],"Short bones","Carpals and tarsals are short bones that articulate with many other bones.")
P('Picture: bone types','irregularbones',"The vertebrae, sacrum and coccyx highlighted in red are examples of…",["Long bones","Short bones","Flat bones","Irregular bones"],"Irregular bones","Irregular bones have specialised shapes and functions.")
P('Picture: bone types','flatbones',"The sternum, ribs, scapula and hip bones highlighted are examples of…",["Long bones","Short bones","Flat bones","Irregular bones"],"Flat bones","Flat bones are the most important for protection.")
P('Picture: bone types','flatbones',"What is the main function of the bones highlighted?",["Protection","Movement as levers","Shock absorption between vertebrae","Linking nerves"],"Protection","Flat bones protect organs (skull, ribs, sternum, pelvis).")
P('Picture: skeleton','skeleton',"Which two labelled bones form the knee joint?",["J and L","J and H","L and M","F and G"],"J and L","Femur (J) + tibia (L) = knee joint.",fix=1)
P('Picture: skeleton','skeleton',"Which two labelled bones form the hip joint?",["H and J","J and L","O and H","D and F"],"H and J","Pelvis (H) + femur (J) = hip joint.",fix=1)
P('Picture: skeleton','skeleton',"Which two labelled bones form the pectoral (shoulder) girdle?",["B and D","C and E","F and G","B and C"],"B and D","Clavicle (B) + scapula (D) = pectoral girdle.",fix=1)
P('Picture: skeleton','skeleton',"Which labelled bones belong to the AXIAL skeleton?",["A, C and E","B, D and F","H, J and L","I, N and K"],"A, C and E","Skull, sternum and ribs are axial; limbs and girdles are appendicular.",fix=1)
P('Picture: skeleton','skeleton',"Which labelled bones belong to the APPENDICULAR skeleton?",["F, J and L","A, C and E","O, P and Q","A, E and Q"],"F, J and L","Humerus, femur and tibia are appendicular (limbs).",fix=1)
P('Picture: skeleton','skeleton',"How many vertebrae are in region P?",["5","7","12","4"],"7","P = cervical vertebrae: 7.",fix=1)
P('Picture: skeleton','skeleton',"How many vertebrae are in region Q?",["5","7","12","4"],"12","Q = thoracic vertebrae: 12, one for each pair of ribs.",fix=1)
P('Picture: skeleton','skeleton',"Bone C is mainly for…",["Protection","Movement","Blood cell production only","Attaching the leg"],"Protection","C is the sternum, a flat bone that protects the heart and lungs.")
P('Picture: skeleton','skeleton',"Which labelled bones are short bones?",["I and N","J and F","C and D","O and P"],"I and N","Carpals (I) and tarsals (N) are short bones.",fix=1)
P('Picture: arm bones','armbones',"Which two labelled bones form the elbow joint (according to class)?",["A and C","A and B","B and D","D and E"],"A and C","The lower end of the humerus (A) connects with the proximal ulna (C) to form the elbow.",fix=1)
P('Picture: arm bones','armbones',"Which two labelled bones form the wrist?",["B and D","A and C","E and F","A and B"],"B and D","Radius (B) + carpals (D) = wrist.",fix=1)
P('Picture: leg bones','legbones',"Which two labelled bones form the knee joint?",["A and C","C and D","A and B","D and E"],"A and C","Femur (A) + tibia (C) = knee.",fix=1)
P('Picture: leg bones','legbones',"Which labelled bones articulate with the talus to form the ankle?",["C and D","A and B","E and F","A and C"],"C and D","Tibia (C) and fibula (D) + talus = ankle joint.",fix=1)
P('Picture: leg bones','legbones',"This diagram shows part of which division of the skeleton?",["Appendicular","Axial","Vertebral column","Cranium"],"Appendicular","Limbs and girdles form the appendicular skeleton.")
P('Picture: anatomical terms','anatomical',"Using the labels, the elbow is ___ to the wrist.",["E (proximal)","F (distal)","G (medial)","H (lateral)"],"E (proximal)","The elbow is closer to the trunk than the wrist: proximal.",fix=1)
P('Picture: anatomical terms','anatomical',"Using the labels, the navel is ___ to the spine.",["A (posterior)","B (anterior)","C (superior)","D (inferior)"],"B (anterior)","The navel is in front of the spine: anterior.",fix=1)
P('Picture: anatomical terms','anatomical',"Using the labels, the head is ___ to the chest.",["C (superior)","D (inferior)","E (proximal)","H (lateral)"],"C (superior)","The head is above the chest: superior.",fix=1)
P('Picture: anatomical terms','anatomical',"Using the labels, the arms are ___ to the sternum.",["G (medial)","H (lateral)","A (posterior)","F (distal)"],"H (lateral)","The arms are further from the midline: lateral.",fix=1)
P('Picture: bone','bonestruct',"Which labelled tissue produces blood cells (haemopoiesis)?",["A","C","E","F"],"E","Red bone marrow (E) produces blood cells.",fix=1)
P('Picture: bone','bonestruct',"Tissue C has no blood vessels of its own. What consequence does this have?",["It heals slowly after injury","It produces blood cells","It contracts","It conducts nerve impulses"],"It heals slowly after injury","Cartilage lacks its own blood supply, so it heals slowly.")
P('Picture: muscles front','front',"In a lateral raise, muscle A is the agonist. Which muscle on the posterior view is its antagonist?",["Latissimus dorsi","Gastrocnemius","Gluteus maximus","Hamstrings"],"Latissimus dorsi","The deltoid abducts; the latissimus dorsi adducts the shoulder.")
P('Picture: muscles front','front',"Muscle E is the agonist in kicking a ball. What type of contraction does it perform as the leg swings through?",["Concentric","Eccentric","Isometric","None"],"Concentric","The quadriceps shorten under tension to extend the knee: concentric.")
P('Picture: muscles back','back',"During a sit-to-stand, which letter shows the main hip extensor?",["A","B","C","D"],"C","The gluteus maximus (C) extends the hip.",fix=1)
P('Picture: muscles back','back',"Muscle D is the agonist when the heel is pulled towards the buttock. Its antagonist is the…",["Quadriceps","Gastrocnemius","Deltoid","Trapezius"],"Quadriceps","Knee flexion: hamstrings agonist, quadriceps antagonist.")
P('Picture: muscles back','back',"In the upward phase of a push-up, muscle F contracts. What type of contraction?",["Concentric","Eccentric","Isometric","Reflex"],"Concentric","The triceps (F) shortens under tension as the elbow extends.")
P('Picture: neuron','neuron',"Why is the axon unmyelinated where it meets a muscle fibre?",["The neuron joins the muscle at the neuromuscular junction across a synapse","It needs to receive signals there","It is the cell body","Myelin is only found in the brain"],"The neuron joins the muscle at the neuromuscular junction across a synapse","At the motor end plate the axon is unmyelinated and a synapse separates it from the muscle fibre.")
P('Picture: nerves','reflex',"Put the labelled structures in the order the impulse travels.",["A → B → C → D → E","A → D → C → B → E","E → D → C → B → A","B → A → C → E → D"],"A → B → C → D → E","Receptor → afferent → interneuron → efferent → effector.",fix=1)
P('Picture: nerves','reflex',"Which labelled structures belong to the CNS?",["Only C","A and B","D and E","A and E"],"Only C","The interneuron (C) lies in the spinal cord; B and D are peripheral nerves.",fix=1)
P('Picture: fascia','fascia',"Order the fascia layers from the outside of the muscle inwards.",["A → B → C","C → B → A","B → A → C","A → C → B"],"A → B → C","Epimysium (A) → perimysium (B) → endomysium (C).",fix=1)
# photos
P('Picture: sport','tennis',"The tennis player swings the racket forwards across the body in a forehand. At the shoulder this is mainly…",["Horizontal flexion","Horizontal extension","Plantar flexion","Adduction of the hip"],"Horizontal flexion","Bringing the arm forwards across the body at shoulder height is horizontal flexion.")
P('Picture: sport','tennis',"The player watches the ball while his body knows where the racket arm is. Which receptors give this information?",["Proprioceptors","Chemoreceptors","Baroreceptors","Thermoreceptors"],"Proprioceptors","Proprioceptors give information on body position and movement.")
P('Picture: sport','tennis',"Which brain structure is most responsible for the smooth timing of this stroke?",["Cerebellum","Brain stem","Hypothalamus","Thalamus"],"Cerebellum","The cerebellum coordinates movement and fine motor control.")
P('Picture: sport','tennis',"Hitting this forehand is a voluntary action controlled by the…",["Somatic nervous system","Autonomic nervous system","Parasympathetic system","Baroreceptor reflex"],"Somatic nervous system","Voluntary skeletal muscle movement is somatic.")
P('Picture: sport','snatch',"In this weightlifting snatch the lifter drives upwards by extending the knees. Agonist?",["Quadriceps","Hamstrings","Tibialis anterior","Biceps brachii"],"Quadriceps","Knee extension: quadriceps agonist.")
P('Picture: sport','snatch',"Which motor units are mainly recruited for this maximal, explosive lift?",["Type IIb","Type I","Type IIa only","Sensory units"],"Type IIb","Type IIb produce the largest forces with the fastest contraction.")
P('Picture: sport','snatch',"The bar is held still overhead for a moment. The arm muscles perform which contraction?",["Isometric","Concentric","Eccentric","No contraction"],"Isometric","Tension without change in length = isometric.")
P('Picture: sport','snatch',"Holding the bar overhead, the elbows are straight. Which muscle keeps the elbows extended?",["Triceps brachii","Biceps brachii","Hamstrings","Gastrocnemius"],"Triceps brachii","The triceps extends the elbow.")
P('Picture: sport','cycleswim',"On the downstroke of the pedal, the cyclist's knee extends. Agonist?",["Quadriceps","Hamstrings","Tibialis anterior","Iliopsoas"],"Quadriceps","Knee extension: quadriceps.")
P('Picture: sport','cycleswim',"During a 3-hour cycle ride, which motor units are mainly used?",["Type I","Type IIb","Only Type IIa","No motor units"],"Type I","Long endurance work relies on fatigue-resistant Type I units.")
P('Picture: sport','cycleswim',"As the rider works harder, blood CO₂ rises and breathing rate increases. Which receptors detect the CO₂?",["Chemoreceptors","Baroreceptors","Proprioceptors","Nociceptors"],"Chemoreceptors","Chemoreceptors detect chemical changes in the blood.")
P('Picture: sport','sprint',"In the sprint finish, the leg pushing off the track plantar flexes the ankle. Agonist?",["Gastrocnemius","Tibialis anterior","Rectus abdominis","Deltoid"],"Gastrocnemius","The calf plantar flexes the ankle.")
P('Picture: sport','sprint',"As the sprinter's leg drives backwards, the hip extends. Agonist?",["Gluteus maximus","Iliopsoas","Rectus abdominis","Tibialis anterior"],"Gluteus maximus","Hip extension: gluteus maximus.")
P('Picture: sport','hike',"The walker's heart rate rises slightly on an uphill path. Which division of the ANS causes this?",["Sympathetic","Parasympathetic","Somatic","Sensory"],"Sympathetic","The sympathetic system increases heart rate during exercise.")
P('Picture: sport','yoga',"In pose 05 the athlete bends forward with straight legs. Which muscles are being stretched at the back of the thigh?",["Hamstrings","Quadriceps","Tibialis anterior","Rectus abdominis"],"Hamstrings","Hip flexion with straight knees stretches the hamstrings.")
P('Picture: sport','yoga',"Muscles can be stretched beyond resting length in these poses. Which property allows this?",["Extensibility","Excitability","Contractility","Atrophy"],"Extensibility","Extensibility = muscle can lengthen beyond its resting length.")
P('Picture: sport','volley',"In this forearm pass, the player straightens the legs to lift the ball. Which muscles extend the knees?",["Quadriceps","Hamstrings","Gastrocnemius","Biceps"],"Quadriceps","Knee extension: quadriceps.")
P('Picture: sport','volley',"The player bends the knees to get under the ball while controlling the lowering. The quadriceps contract…",["Eccentrically","Concentrically","Isometrically","Not at all"],"Eccentrically","Controlling knee flexion under load = eccentric quadriceps.")

# ================= TEXT GENERATORS =================
MUSCLES=["Biceps brachii","Triceps brachii","Quadriceps","Hamstrings","Gluteus maximus","Iliopsoas","Gastrocnemius","Tibialis anterior","Deltoid","Latissimus dorsi","Rectus abdominis","Erector spinae","Pectoralis major","Trapezius"]
MOVES=[ # joint movement, agonist, antagonist, contexts
 ("elbow flexion","Biceps brachii","Triceps brachii",["the lifting phase of a biceps curl","pulling the body up in a chin-up (at the elbow)","a rower pulling the oar handle to the chest (at the elbow)"]),
 ("elbow extension","Triceps brachii","Biceps brachii",["the upward phase of a push-up (at the elbow)","a basketball chest pass (at the elbow)","the upward phase of a bench press (at the elbow)"]),
 ("knee extension","Quadriceps","Hamstrings",["kicking a football","standing up from a squat (at the knee)","the take-off leg straightening in a long jump (at the knee)"]),
 ("knee flexion","Hamstrings","Quadriceps",["the recovery phase of sprinting, heel towards the buttock","a leg-curl machine exercise"]),
 ("hip flexion","Iliopsoas","Gluteus maximus",["lifting the knee in a high-knees drill","swinging the leg forwards before a kick (at the hip)"]),
 ("hip extension","Gluteus maximus","Iliopsoas",["driving the leg backwards when sprinting (at the hip)","rising from a deep squat (at the hip)"]),
 ("plantar flexion","Gastrocnemius","Tibialis anterior",["a calf raise","pushing off the blocks in a sprint start (at the ankle)","the take-off for a basketball jump (at the ankle)"]),
 ("dorsiflexion","Tibialis anterior","Gastrocnemius",["pulling the toes up as the heel strikes the ground in walking"]),
 ("shoulder abduction","Deltoid","Latissimus dorsi",["the upward phase of a lateral raise","raising the arms sideways in a jumping jack"]),
 ("shoulder adduction","Latissimus dorsi","Deltoid",["a lat pull-down (at the shoulder)","bringing the arms back down to the sides in a jumping jack"]),
 ("trunk flexion","Rectus abdominis","Erector spinae",["the upward phase of a sit-up","a crunch"]),
 ("trunk extension","Erector spinae","Rectus abdominis",["a back-extension exercise","straightening up after picking a ball off the floor"]),
]
for mv,ag,an,ctxs in MOVES:
    for c in ctxs:
        add("Agonist and antagonist (scenarios)",None,f"During {c}, the movement is {mv}. Which muscle is the AGONIST?",[ag]+pick([m for m in MUSCLES if m!=an],ag,2)+[an],ag,f"In {mv} the {ag.lower()} is the agonist (prime mover); the {an.lower()} is the antagonist.")
        add("Agonist and antagonist (scenarios)",None,f"During {c} ({mv}), which muscle acts as the ANTAGONIST?",[an]+pick([m for m in MUSCLES if m!=ag],an,2)+[ag],an,f"The antagonist relaxes and lengthens: in {mv} that is the {an.lower()}, opposite the {ag.lower()}.")
    add("Agonist and antagonist (scenarios)",None,f"Which is the correct agonist / antagonist pair for {mv}?",[f"{ag} / {an}",f"{an} / {ag}"]+[f"{a} / {b}" for a,b in [random.sample([m for m in MUSCLES if m not in (ag,an)],2)]]+[f"{ag} / {random.choice([m for m in MUSCLES if m not in (ag,an)])}"],f"{ag} / {an}",f"{mv.capitalize()}: {ag} contracts, {an} lengthens.")

CONTR=[("the upward phase of a biceps curl","biceps","Concentric"),("slowly lowering the dumbbell in a biceps curl","biceps","Eccentric"),
 ("holding a dumbbell still with the elbow at 90°","biceps","Isometric"),("the upward phase of a squat","quadriceps","Concentric"),
 ("the downward phase of a squat","quadriceps","Eccentric"),("holding a wall-sit","quadriceps","Isometric"),("holding a plank","rectus abdominis","Isometric"),
 ("landing from a jump as the knees bend","quadriceps","Eccentric"),("the downward phase of a push-up","triceps","Eccentric"),("the upward phase of a push-up","triceps","Concentric"),
 ("pulling up in a pull-up","latissimus dorsi","Concentric"),("lowering slowly from a pull-up","latissimus dorsi","Eccentric"),("rising onto the toes in a calf raise","gastrocnemius","Concentric"),
 ("slowly lowering the heels after a calf raise","gastrocnemius","Eccentric"),("holding a handstand still","triceps","Isometric"),("the upward phase of a sit-up","rectus abdominis","Concentric"),
 ("lowering the back slowly to the floor after a sit-up","rectus abdominis","Eccentric"),("a tug-of-war where neither team moves","biceps","Isometric"),
 ("walking downhill as each knee bends under load","quadriceps","Eccentric"),("the upward phase of a lateral raise","deltoid","Concentric")]
DEF={"Concentric":"the muscle shortens under tension","Eccentric":"the muscle lengthens under tension","Isometric":"the muscle is under tension but does not change length"}
for c,m,t in CONTR:
    add("Types of contraction",None,f"What type of contraction does the {m} perform during {c}?",["Concentric","Eccentric","Isometric","Reciprocal inhibition"],t,f"{t}: {DEF[t]}.",fix=1)

TERMS=[("elbow","wrist","proximal"),("wrist","elbow","distal"),("knee","hip","distal"),("hip","knee","proximal"),("ankle","knee","distal"),("shoulder","elbow","proximal"),
 ("fingers","wrist","distal"),("nose","ears","medial"),("ears","nose","lateral"),("thumb","little finger (anatomical position)","lateral"),("little finger","thumb (anatomical position)","medial"),
 ("head","chest","superior"),("feet","knees","inferior"),("chest","shoulder blades","anterior"),("spine","stomach","posterior"),("sternum","spine","anterior"),("calf","shin","posterior"),
 ("big toe","little toe","medial"),("chin","navel","superior"),("pelvis","ribs","inferior")]
ALLT=["proximal","distal","medial","lateral","superior","inferior","anterior","posterior"]
TD={"proximal":"closer to the trunk","distal":"further from the trunk","medial":"closer to the midline","lateral":"further from the midline","superior":"above","inferior":"below","anterior":"in front","posterior":"behind"}
OPP={"proximal":"distal","distal":"proximal","medial":"lateral","lateral":"medial","superior":"inferior","inferior":"superior","anterior":"posterior","posterior":"anterior"}
for a,b,t in TERMS:
    opts=[t,OPP[t]]+pick([x for x in ALLT if x not in (t,OPP[t])],t,2)
    add("Anatomical terms and movements",None,f"In the anatomical position, the {a} is ______ to the {b}.",opts,t,f"{t.capitalize()} = {TD[t]}.")

MDESC=[("decreases the angle between two bones","Flexion"),("increases the angle between two bones","Extension"),("moves a limb away from the midline","Abduction"),
 ("moves a limb towards the midline","Adduction"),("turns a limb towards the midline around its long axis","Internal rotation"),("turns a limb away from the midline around its long axis","External rotation"),
 ("brings the toes up towards the shin","Dorsiflexion"),("points the toes downwards","Plantar flexion"),("turns the sole of the foot inwards","Inversion"),("turns the sole of the foot outwards","Eversion"),
 ("combines flexion, extension, abduction and adduction in a circular motion","Circumduction")]
ALLM=[m for _,m in MDESC]
for d,m in MDESC:
    add("Anatomical terms and movements",None,f"Which joint movement {d}?",[m]+pick(ALLM,m),m,f"{m} {d}.")
SPM=[("bringing the knee towards the chest in a tuck jump","hip","Flexion"),("raising the arms sideways in a jumping jack","shoulder","Abduction"),
 ("bending the elbow in a chin-up","elbow","Flexion"),("straightening the knee to kick a ball","knee","Extension"),("bringing the arms back to the sides in a jumping jack","shoulder","Adduction"),
 ("standing on tiptoes to block in volleyball","ankle","Plantar flexion"),("swinging the leg out sideways in a side step","hip","Abduction"),("bowling arm swinging in a full circle in cricket","shoulder","Circumduction"),
 ("pulling the leg back before kicking","hip","Extension"),("bending forward to touch the toes","trunk (spine)","Flexion"),("rolling an ankle so the sole faces inwards","ankle","Inversion"),
 ("turning the head to look over the shoulder","neck (atlas–axis)","Rotation")]
ALLM2=ALLM+["Rotation"]
for c,j,m in SPM:
    add("Anatomical terms and movements",None,f"An athlete is {c}. Which movement occurs at the {j}?",[m]+pick(ALLM2,m),m,f"{c.capitalize()}: {m.lower()} at the {j}.")

JT=[("hip","Ball and socket"),("shoulder","Ball and socket"),("knee","Hinge"),("elbow","Hinge"),("ankle","Hinge"),("atlas and axis (neck rotation)","Pivot"),
 ("thumb carpometacarpal joint","Saddle"),("knuckles (metacarpophalangeal joints)","Condyloid"),("acromioclavicular joint","Plane (gliding)"),("joints between carpals","Plane (gliding)")]
ALLJ=["Ball and socket","Hinge","Pivot","Saddle","Condyloid","Plane (gliding)"]
for j,t in JT:
    add("Joints",None,f"What type of synovial joint is the {j}?",[t]+pick(ALLJ,t),t,f"The {j} is a {t.lower()} joint.")
JM=[("Hinge","Flexion and extension only"),("Ball and socket","Movement on several axes, including rotation"),("Pivot","Rotation only"),("Saddle","Movement in two planes (biaxial)"),
 ("Condyloid","Flexion, extension, abduction, adduction and circumduction"),("Plane (gliding)","Gliding or sliding movements")]
for t,m in JM:
    add("Joints",None,f"Which movement does a {t.lower()} joint allow?",[m]+pick([x for _,x in JM],m),m,f"{t} joints: {m.lower()}.")
add("Joints",None,"Fibrous and cartilaginous joints differ from synovial joints because they…",["Have no joint cavity","Have more mobility","Always allow rotation","Contain synovial fluid"],"Have no joint cavity","Only synovial joints have a joint cavity.")
add("Joints",None,"The skull sutures are an example of which type of joint?",["Fibrous","Cartilaginous","Synovial hinge","Synovial pivot"],"Fibrous","Skull sutures are fibrous joints with almost no movement.")
add("Joints",None,"The joints between vertebrae (with intervertebral discs) are…",["Cartilaginous","Fibrous","Synovial ball and socket","Synovial hinge"],"Cartilaginous","Intervertebral discs form cartilaginous joints that allow slight movement.")

BJ=[("hip joint","Pelvis and femur"),("knee joint","Femur and tibia"),("ankle joint","Tibia and fibula with the talus"),("shoulder joint","Humerus and scapula"),
 ("elbow joint","Humerus and ulna"),("wrist","Radius and carpal bones")]
for j,b in BJ:
    add("Skeleton",None,f"Which bones form the {j}?",[b]+pick([x for _,x in BJ],b),b,f"{j.capitalize()}: {b.lower()}.")
BT=[("femur","Long"),("humerus","Long"),("metatarsals","Long"),("clavicle","Long"),("carpals","Short"),("tarsals","Short"),("sternum","Flat"),("ribs","Flat"),
 ("scapula","Flat"),("pelvis","Flat"),("cranium","Flat"),("vertebrae","Irregular"),("sacrum","Irregular"),("coccyx","Irregular")]
for b,t in BT:
    add("Skeleton",None,f"The {b} is classified as which type of bone?",["Long","Short","Flat","Irregular"],t,f"The {b}: {t.lower()} bone.",fix=1)
AX=[("skull","Axial"),("ribs","Axial"),("sternum","Axial"),("vertebral column","Axial"),("humerus","Appendicular"),("femur","Appendicular"),("clavicle","Appendicular"),
 ("scapula","Appendicular"),("pelvic girdle","Appendicular"),("tibia","Appendicular")]
for b,t in AX:
    add("Skeleton",None,f"The {b} belongs to which part of the skeleton?",["Axial","Appendicular"],t,("Axial = skull, vertebral column, ribs and sternum." if t=="Axial" else "Appendicular = limbs plus the shoulder and pelvic girdles."),fix=1)
for reg,n in [("cervical","7"),("thoracic","12"),("lumbar","5"),("sacral","5"),("coccygeal","4")]:
    add("Skeleton",None,f"How many vertebrae are in the {reg} region?",["4","5","7","12"],n,"Cervical 7, thoracic 12, lumbar 5, sacral 5, coccygeal 4 = 33.",fix=1)
add("Skeleton",None,"How many vertebrae are there in total?",["24","26","33","36"],"33","7 + 12 + 5 + 5 + 4 = 33.",fix=1)
add("Skeleton",None,"The skeleton makes up roughly what share of body weight?",["5%","20%","45%","60%"],"20%","The skeleton is about 20% of body weight.",fix=1)
add("Skeleton",None,"Which curves of the vertebral column are anteriorly convex?",["Cervical and lumbar","Thoracic and sacral","Only thoracic","Only coccygeal"],"Cervical and lumbar","Cervical and lumbar curves are anteriorly convex; thoracic and sacral are concave.")
add("Skeleton",None,"Which mineral is stored and released by bone?",["Calcium","Sodium","Iron only","Potassium only"],"Calcium","Bones store and release calcium and phosphorus.")

SYM=[("dilating the pupils","Sympathetic"),("constricting the pupils","Parasympathetic"),("increasing heart rate","Sympathetic"),("decreasing heart rate","Parasympathetic"),
 ("relaxing (dilating) the airways","Sympathetic"),("constricting the airways","Parasympathetic"),("inhibiting digestive activity","Sympathetic"),("stimulating digestive activity","Parasympathetic"),
 ("secreting adrenaline and noradrenaline","Sympathetic"),("stimulating saliva","Parasympathetic"),("increasing blood flow to working muscles","Sympathetic"),("promoting recovery after a match","Parasympathetic")]
for e,s in SYM:
    add("Autonomic nervous system",None,f"Which division of the autonomic nervous system is responsible for {e}?",["Sympathetic","Parasympathetic","Somatic","Afferent"],s,f"{'Sympathetic = fight or flight' if s=='Sympathetic' else 'Parasympathetic = rest and digest'}.",fix=1)
REC=[("A diver's CO₂ level rises while holding her breath.","Chemoreceptors"),("Blood pH falls in the last 100 m of a 400 m race.","Chemoreceptors"),
 ("A climber's blood O₂ level falls at high altitude.","Chemoreceptors"),("A swimmer's breathing rate increases because CO₂ is rising.","Chemoreceptors"),
 ("Blood pressure drops when an athlete stands up quickly.","Baroreceptors"),("Blood pressure rises sharply during a heavy deadlift.","Baroreceptors"),
 ("A cyclist's blood pressure changes when moving from lying to standing.","Baroreceptors"),("A footballer senses the angle of his knee without looking.","Proprioceptors"),
 ("A gymnast knows her body position in the middle of a twist.","Proprioceptors"),("A basketball player dribbles without looking at the ball.","Proprioceptors"),
 ("A goalkeeper senses where his arms are while diving.","Proprioceptors"),("A runner adjusts foot placement on uneven ground.","Proprioceptors")]
for s,r in REC:
    add("Receptors",None,f"{s} Which receptors detect this change?",["Chemoreceptors","Baroreceptors","Proprioceptors","Nociceptors"],r,{"Chemoreceptors":"Chemoreceptors detect O₂, CO₂ and pH (carotid arteries and aorta).","Baroreceptors":"Baroreceptors detect blood pressure (aorta and carotid arteries).","Proprioceptors":"Proprioceptors (muscles, tendons, joints) detect body position and movement."}[r],fix=1)
BR=[("keeping balance on a surfboard","Cerebellum"),("deciding to pass the ball to a teammate","Cerebral cortex"),("regulating breathing while asleep","Brain stem"),
 ("controlling body temperature during a marathon","Diencephalon (hypothalamus)"),("producing a smooth, coordinated golf swing","Cerebellum"),("keeping the heart beating at rest","Brain stem"),
 ("consciously choosing to start running","Cerebral cortex"),("feeling hungry after training","Diencephalon (hypothalamus)"),("relaying touch information to the cortex","Diencephalon (thalamus)")]
ALLB=["Cerebellum","Cerebral cortex","Brain stem","Diencephalon (hypothalamus)","Diencephalon (thalamus)"]
for s,b in BR:
    opts=[b]+pick([x for x in ALLB if x.split()[0]!=b.split()[0]],b)
    add("Brain structures",None,f"Which brain structure is mainly responsible for {s}?",opts,b,{"Cerebellum":"Cerebellum: balance and coordination.","Cerebral cortex":"Cerebral cortex: conscious thought and voluntary movement.","Brain stem":"Brain stem: breathing, heart rate and blood pressure.","Diencephalon (hypothalamus)":"Hypothalamus (diencephalon): temperature, hunger, sleep.","Diencephalon (thalamus)":"Thalamus: relay centre for sensory information."}[b])
MU=[("running a marathon","Type I"),("a 100 m sprint","Type IIb"),("a shot put","Type IIb"),("a high-jump take-off","Type IIb"),("a long-distance triathlon","Type I"),
 ("an 800 m race","Type IIa"),("a 400 m race","Type IIa"),("maintaining posture while standing","Type I"),("a maximal weightlifting snatch","Type IIb"),("a 10 km run","Type I"),
 ("a 200 m swim","Type IIa"),("a javelin throw","Type IIb"),("a 4-hour cycle ride","Type I")]
for s,t in MU:
    add("Neuron and motor unit",None,f"Which motor units are mainly recruited for {s}?",["Type I","Type IIa","Type IIb"],t,{"Type I":"Type I: slow, small forces, long contractions, fatigue resistant.","Type IIa":"Type IIa: fast, strong and resistant to fatigue, for middle-distance efforts.","Type IIb":"Type IIb: fastest contraction, largest forces, fatigue quickly."}[t],fix=1)
AE=[("A sprinter hears the starting gun; the signal travels from the ear to the brain.","Afferent (sensory)"),("The brain sends a signal to the leg muscles to start running.","Efferent (motor)"),
 ("Stretch receptors in the hamstrings send information to the spinal cord.","Afferent (sensory)"),("A signal travels from the spinal cord to the quadriceps to contract.","Efferent (motor)"),
 ("Temperature receptors in the skin report heat to the CNS.","Afferent (sensory)"),("The CNS signals sweat glands to produce sweat.","Efferent (motor)")]
for s,t in AE:
    add("Divisions of the nervous system",None,f"{s} Which type of neuron carries this signal?",["Afferent (sensory)","Efferent (motor)","Interneuron only","Myelin"],t,"Afferent = towards the CNS; efferent = away from the CNS to muscles and glands.",fix=1)
PROP=[("A muscle shortens to produce movement.","Contractility"),("A muscle responds to a nerve impulse.","Excitability"),("A hamstring is stretched beyond its resting length in a warm-up.","Extensibility"),
 ("After being stretched, a muscle returns to its original length without damage.","Elasticity"),("After months of weight training, the biceps grows larger.","Hypertrophy"),
 ("After a leg is in a cast for six weeks, the calf becomes smaller.","Atrophy")]
ALLP=["Contractility","Excitability","Extensibility","Elasticity","Hypertrophy","Atrophy"]
for s,p in PROP:
    add("Muscles and contraction",None,f"{s} Which characteristic of muscle tissue is described?",[p]+pick(ALLP,p),p,f"{p} is described here.")
EX=[
 ("Muscles and contraction","Which muscle type is involuntary and found only in the heart?",["Cardiac","Skeletal","Smooth","Striated voluntary"],"Cardiac","Cardiac muscle is involuntary and only in the heart."),
 ("Muscles and contraction","Which muscle type is found in the walls of hollow organs such as the stomach?",["Smooth","Skeletal","Cardiac","Voluntary"],"Smooth","Smooth muscle is involuntary and lines hollow organs."),
 ("Muscles and contraction","Muscles receive a constant supply of oxygen-rich blood through…",["Capillaries","Tendons","Ligaments","Cartilage"],"Capillaries","Muscles are fed by capillaries supplying oxygen and nutrients."),
 ("Connective tissue and joints","Connective tissue is best described as tissue that…",["Maintains the form of the body and provides support and cohesion","Produces nerve impulses","Contracts to create movement","Only stores fat"],"Maintains the form of the body and provides support and cohesion","Connective tissues maintain form and provide internal support."),
 ("Connective tissue and joints","Fascia contains…",["Fibrous tissue, fat and fluid","Only bone cells","Nerve cells only","Synovial fluid only"],"Fibrous tissue, fat and fluid","Fascia is connective tissue between and around muscles."),
 ("Connective tissue and joints","Tendons are extensions of which structures beyond the muscle fibres?",["The fascia layers (epimysium, perimysium, endomysium)","Ligaments","Cartilage","Bone marrow"],"The fascia layers (epimysium, perimysium, endomysium)","Tendons extend from the fascia layers."),
 ("Connective tissue and joints","Ligaments restrict movement once a joint reaches its normal limits. What else do they do?",["Resist abnormal movements, e.g. sideways bending of the elbow","Transmit muscle force","Produce synovial fluid","Store calcium"],"Resist abnormal movements, e.g. sideways bending of the elbow","Ligaments stabilise and resist abnormal movements."),
 ("Connective tissue and joints","Which statement about cartilage is correct?",["It lacks blood vessels and nerves except in the perichondrium","It has a rich blood supply","It connects muscle to bone","It is very rigid and has no elasticity"],"It lacks blood vessels and nerves except in the perichondrium","Cartilage is avascular, so it heals slowly."),
 ("Neuron and motor unit","Approximately how many motoneurons are in the human body?",["2,000","200,000","2 million","20"],"200,000","There are about 200,000 motoneurons."),
 ("Neuron and motor unit","The number of muscle fibres per motoneuron ranges from about…",["1 to 5","10 to 2,000","5,000 to 10,000","Exactly 100"],"10 to 2,000","Between 10 and 2,000 fibres per motoneuron."),
 ("Neuron and motor unit","Which part of the neuron is the main component of nerve signal transmission?",["Axon","Dendrite","Soma","Ganglion"],"Axon","The axon transmits the signal."),
 ("Neuron and motor unit","Clusters of neuron cell bodies just outside the spinal cord are called…",["Ganglia","Nodes of Ranvier","Synapses","Dendrites"],"Ganglia","Ganglia are clusters of cell bodies."),
 ("Neuron and motor unit","The gap between a motor neuron and a muscle fibre is called the…",["Synapse","Node of Ranvier","Myelin","Soma"],"Synapse","The synapse is the gap at the neuromuscular junction."),
 ("Divisions of the nervous system","A pinch on the hand is felt within about…",["0.01–0.2 seconds","2–5 seconds","1 minute","10 seconds"],"0.01–0.2 seconds","Over less than a metre, transmission takes about 0.01–0.2 s."),
 ("Divisions of the nervous system","The main purpose of the nervous system sensing internal and external conditions is to…",["Coordinate responses and maintain homeostasis","Produce blood cells","Store energy","Move bones directly"],"Coordinate responses and maintain homeostasis","It senses conditions and coordinates responses to maintain homeostasis."),
 ("Autonomic nervous system","Which statement about the heart's SA node is correct?",["It is the heart's pacemaker that generates rhythm","It is a baroreceptor","It is part of the cerebellum","It is controlled by the somatic system"],"It is the heart's pacemaker that generates rhythm","SA node = intrinsic pacemaker."),
 ("Receptors","Proprioceptors, baroreceptors and chemoreceptors are best described as…",["Specialised cells that respond to stimuli to start nervous system responses","Types of muscle fibre","Parts of the brain stem","Bones in the inner ear"],"Specialised cells that respond to stimuli to start nervous system responses","All three are specialised sensory receptors."),
]
for t,q,o,a,e in EX: add(t,None,q,o,a,e)

json.dump(Q,open('gen.json','w'))
from collections import Counter
print(len(Q)); print(Counter(x[0] for x in Q).most_common())
